import { ENDPOINTS } from '@/config/api';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes,
  getDownloadURL,
  deleteObject 
} from "firebase/storage";
import { firestore } from '../../../firestore';
import crypto from 'crypto';

class ClipService {
  constructor() {
    this.storage = getStorage();
  }

  // Helper function to hash passwords
  async hashPassword(password) {
    // const salt = crypto.randomBytes(16).toString('hex');
    // return new Promise((resolve, reject) => {
    //   crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
    //     if (err) reject(err);
    //     resolve(`${salt}:${derivedKey.toString('hex')}`);
    //   });
    // });
    if (!password) return null;
    
    // Using crypto for password hashing
    return crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
  }

  // Helper function to verify passwords
  async verifyPassword(password, hashedPassword) {
    if (!password || !hashedPassword) return false;
    
    const inputHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    return inputHash === hashedPassword;
  }

  // Create text-only clip
  async createTextClip(clipData) {
    try {
      // Hash password if provided
      const passwordHash = clipData.password ? 
        await this.hashPassword(clipData.password) : null;

      // Calculate expiration timestamp
      const expiresAt = this.calculateExpiration(clipData.expire_option);

      // Create clip document in Firestore
      const clipRef = await addDoc(collection(firestore, 'clips'), {
        content_type: 'text',
        text_content: clipData.text_content,
        file_urls: [],
        file_metadata: [],
        password_hash: passwordHash,
        created_at: serverTimestamp(),
        expires_at: expiresAt ? Timestamp.fromDate(expiresAt) : null,
        url_slug: clipData.url_slug
      });

      return {
        id: clipRef.id,
        url_slug: clipData.url_slug
      };
    } catch (error) {
      throw new Error(`Failed to create text clip: ${error.message}`);
    }
  }

  // Create clip with files
  async createFileClip(clipData) {
    try {
      const fileUrls = [];
      const fileMetadata = [];

      // Upload files to Firebase Storage
      const uploadPromises = clipData.files.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const fileRef = ref(this.storage, `clips/${fileName}`);
        
        // Upload with metadata
        const metadata = {
          contentType: file.type,
          customMetadata: {
            originalName: file.name
          }
        };
        
        await uploadBytes(fileRef, file, metadata);
        const downloadUrl = await getDownloadURL(fileRef);
        
        fileUrls.push(downloadUrl);
        fileMetadata.push({
          original_name: file.name,
          stored_name: fileName,
          size: file.size,
          type: file.type,
          url: downloadUrl
        });
      });

      await Promise.all(uploadPromises);

      // Hash password if provided
      const passwordHash = clipData.password ? 
        await this.hashPassword(clipData.password) : null;

      // Calculate expiration timestamp
      const expiresAt = this.calculateExpiration(clipData.expire_option);

      // Create clip document in Firestore
      const clipRef = await addDoc(collection(firestore, 'clips'), {
        content_type: 'file',
        text_content: clipData.text_content || null,
        file_urls: fileUrls,
        file_metadata: fileMetadata,
        password_hash: passwordHash,
        created_at: serverTimestamp(),
        expires_at: expiresAt ? Timestamp.fromDate(expiresAt) : null,
        url_slug: clipData.url_slug
      });

      return {
        id: clipRef.id,
        url_slug: clipData.url_slug
      };
    } catch (error) {
      throw new Error(`Failed to create file clip: ${error.message}`);
    }
  }

  // Main create clip function that routes to appropriate handler
  async createClip(clipData) {
    if (!clipData.files?.length) {
      return this.createTextClip(clipData);
    }
    return this.createFileClip(clipData);
  }

  // Read operations
  async getClipBySlug(urlSlug, password = null) {
    try {
      const q = query(
        collection(firestore, 'clips'), 
        where('url_slug', '==', urlSlug)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error('Clip does not exist');
      }

      const doc = querySnapshot.docs[0];
      const clipData = doc.data();

      // Check if clip has expired
      if (clipData.expires_at && clipData.expires_at.toDate() < new Date()) {
        await this.deleteClip(doc.id);
        throw new Error('This clip has expired and is no longer available');
      }

      // Handle password protection
      if (clipData.password_hash) {
        if (!password) {
          return { isProtected: true };
        }
        
        const isValid = await this.verifyPassword(password, clipData.password_hash);
        if (!isValid) {
          throw new Error('Invalid password. Please try again.');
        }
      }

      return {
        id: doc.id,
        ...clipData
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Cleanup operations
  async cleanupExpiredClips() {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(firestore, 'clips'),
        where('expires_at', '<=', now)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(async (doc) => {
        const clipData = doc.data();
        
        // Delete associated files from Firebase Storage
        if (clipData.file_metadata) {
          await Promise.all(clipData.file_metadata.map(file => {
            const fileRef = ref(this.storage, `clips/${file.stored_name}`);
            return deleteObject(fileRef).catch(error => {
              console.error(`Failed to delete file ${file.stored_name}:`, error);
            });
          }));
        }
        
        // Delete the Firestore document
        return deleteDoc(doc.ref);
      });

      await Promise.all(deletePromises);
      return querySnapshot.size;
    } catch (error) {
      throw new Error(`Cleanup failed: ${error.message}`);
    }
  }

  // File handling operations
  async deleteFile(fileName) {
    try {
      const fileRef = ref(this.storage, `clips/${fileName}`);
      await deleteObject(fileRef);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async downloadFile(fileUrl) {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      return response.blob();
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  calculateExpiration(expireOption) {
    if (!expireOption) return null;
    
    const now = new Date();
    
    switch (expireOption) {
      case '1m':
        return new Date(now.getTime() + 1 * 60 * 1000); // 1 minute
      case '10m':
        return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
      case '1h':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case '5h':
        return new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 hours
      case '12h':
        return new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours
      case '1d':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      default:
        return null;
    }
  }


  async deleteClip(clipId) {
    try {
      const clipRef = doc(firestore, 'clips', clipId);
      await deleteDoc(clipRef);
    } catch (error) {
      throw new Error(`Failed to delete clip: ${error.message}`);
    }
  }

}

export default new ClipService();