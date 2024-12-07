import { firestore } from "../../firestore";
import { getStorage, ref } from "firebase/storage";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  orderBy,
  limit
} from "firebase/firestore";
import { deleteObject } from "firebase/storage";

export const adminService = {
  async getDashboardStats() {
    try {
      // Get all clips
      const clipsRef = collection(firestore, "clips");
      const clipsSnapshot = await getDocs(clipsRef);
      const totalClips = clipsSnapshot.size;

      // Get active clips (not expired)
      const now = Timestamp.now();
      const activeClipsQuery = query(
        clipsRef,
        where("expires_at", ">", now)
      );
      const activeClipsSnapshot = await getDocs(activeClipsQuery);
      const activeClips = activeClipsSnapshot.size;

      // Get protected clips
      const protectedClipsQuery = query(
        clipsRef,
        where("password_hash", "!=", null)
      );
      const protectedClipsSnapshot = await getDocs(protectedClipsQuery);
      const protectedClips = protectedClipsSnapshot.size;

      // Get expired clips
      const expiredClipsQuery = query(
        clipsRef,
        where("expires_at", "<=", now)
      );
      const expiredClipsSnapshot = await getDocs(expiredClipsQuery);
      const expiredClips = expiredClipsSnapshot.size;

      // Get flagged content (if implemented)
      const flaggedClipsQuery = query(
        clipsRef,
        where("isFlagged", "==", true)
      );
      const flaggedClipsSnapshot = await getDocs(flaggedClipsQuery);
      const flaggedContent = flaggedClipsSnapshot.size;

      // Calculate storage usage
      let totalStorageUsed = 0;
      const allClips = await getDocs(clipsRef);
      allClips.forEach(doc => {
        const data = doc.data();
        if (data.file_metadata) {
          data.file_metadata.forEach(file => {
            totalStorageUsed += file.size;
          });
        }
      });

      // Convert to MB for readability
      const storageUsedMB = (totalStorageUsed / (1024 * 1024)).toFixed(2);
      // Firebase Spark plan has 5GB limit
      const storageLimitMB = 5 * 1024; // 5GB in MB
      const storagePercentUsed = ((storageUsedMB / storageLimitMB) * 100).toFixed(1);

      // Calculate file type distribution
      const fileTypes = {};
      let totalFiles = 0;

      allClips.forEach(doc => {
        const data = doc.data();
        if (data.file_metadata) {
          data.file_metadata.forEach(file => {
            // Get the general type (image, video, document, etc.)
            const generalType = file.type.split('/')[0];
            fileTypes[generalType] = (fileTypes[generalType] || 0) + 1;
            totalFiles++;
          });
        }
      });

      // Convert to percentages
      const fileDistribution = Object.entries(fileTypes).map(([type, count]) => ({
        type,
        count,
        percentage: ((count / totalFiles) * 100).toFixed(1)
      }));

      return {
        totalClips,
        activeClips,
        protectedClips,
        expiredClips,
        flaggedContent,
        storage: {
          used: Number(storageUsedMB),
          limit: storageLimitMB,
          percentUsed: Number(storagePercentUsed)
        },
        fileDistribution
      };
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  },

  async cleanupExpiredContent() {
    try {
      const clipsRef = collection(firestore, "clips");
      const now = Timestamp.now();
      const stats = {
        filesDeleted: 0,
        storageFreed: 0,
        documentsDeleted: 0,
        errors: []
      };
      const detailedClipData = [];
      const MAX_RETRIES = 3;

      // Query for expired clips
      const expiredQuery = query(
        clipsRef,
        where("expires_at", "<=", now)
      );

      const expiredDocs = await getDocs(expiredQuery);

      for (const doc of expiredDocs.docs) {
        try {
          const data = doc.data();
          const clipData = {
            id: doc.id,
            ...data,
            file_metadata: data.file_metadata || []
          };
          
          // Delete associated files from storage with retry logic
          if (data.file_metadata) {
            for (const file of data.file_metadata) {
              let retries = 0;
              let fileDeleted = false;

              while (retries < MAX_RETRIES && !fileDeleted) {
                try {
                  const fileRef = ref(storage, `clips/${file.stored_name}`);
                  await deleteObject(fileRef);
                  
                  // Verify deletion
                  try {
                    await getDownloadURL(fileRef);
                    throw new Error('File still exists after deletion');
                  } catch (verifyError) {
                    if (verifyError.code === 'storage/object-not-found') {
                      fileDeleted = true;
                      stats.filesDeleted++;
                      stats.storageFreed += file.size || 0;
                    }
                  }
                } catch (fileError) {
                  retries++;
                  if (retries === MAX_RETRIES) {
                    stats.errors.push(`Failed to delete file ${file.stored_name} after ${MAX_RETRIES} attempts: ${fileError.message}`);
                  }
                  await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
                }
              }
            }
          }

          // Delete the document
          await deleteDoc(doc.ref);
          stats.documentsDeleted++;
          detailedClipData.push(clipData);

        } catch (docError) {
          stats.errors.push(`Failed to delete document ${doc.id}: ${docError.message}`);
        }
      }

      // Convert storageFreed to MB for consistency
      stats.storageFreed = Number((stats.storageFreed / (1024 * 1024)).toFixed(2));

      return { stats, detailedClipData };
    } catch (error) {
      console.error('Cleanup operation failed:', error);
      throw new Error(`Cleanup failed: ${error.message}`);
    }
  },

  async getUsageTrends() {
    try {
      const clipsRef = collection(firestore, "clips");
      const allClips = await getDocs(clipsRef);
      
      // Initialize data structure for trends
      const trends = {
        daily: new Array(7).fill(0),  // Last 7 days
        storage: new Array(7).fill(0), // Storage usage over 7 days
        types: {}  // File type distribution over time
      };

      const now = Timestamp.now();
      const oneDay = 24 * 60 * 60 * 1000;

      allClips.forEach(doc => {
        const data = doc.data();
        const createdAt = data.created_at?.toDate();
        if (!createdAt) return;

        // Calculate days ago (0-6)
        const daysAgo = Math.floor((now.toDate() - createdAt) / oneDay);
        if (daysAgo >= 0 && daysAgo < 7) {
          trends.daily[daysAgo]++;

          // Add storage usage
          if (data.file_metadata) {
            const dayStorage = data.file_metadata.reduce((acc, file) => acc + file.size, 0);
            trends.storage[daysAgo] += dayStorage / (1024 * 1024); // Convert to MB

            // Track file types
            data.file_metadata.forEach(file => {
              const type = file.type.split('/')[0];
              if (!trends.types[daysAgo]) trends.types[daysAgo] = {};
              trends.types[daysAgo][type] = (trends.types[daysAgo][type] || 0) + 1;
            });
          }
        }
      });

      return trends;
    } catch (error) {
      throw new Error(`Failed to get usage trends: ${error.message}`);
    }
  },

  async updateCleanupSchedule(schedule = { enabled: true }) {
    try {
      const scheduleRef = doc(firestore, 'system', 'cleanup_schedule');
      // Set next run to first day of next month at 00:00
      const now = new Date();
      const nextRun = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      await setDoc(scheduleRef, {
        enabled: schedule.enabled,
        lastRun: Timestamp.now(),
        nextRun: Timestamp.fromDate(nextRun),
        type: 'monthly'
      });
    } catch (error) {
      throw new Error(`Failed to update cleanup schedule: ${error.message}`);
    }
  },

  async getCleanupSchedule() {
    try {
      const scheduleRef = doc(firestore, 'system', 'cleanup_schedule');
      const scheduleDoc = await getDoc(scheduleRef);
      return scheduleDoc.exists() ? scheduleDoc.data() : null;
    } catch (error) {
      throw new Error(`Failed to get cleanup schedule: ${error.message}`);
    }
  },

  async getTrends() {
    try {
      const clipsRef = collection(firestore, "clips");
      const now = Timestamp.now();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Initialize daily data
      const dailyData = Array(7).fill(0);
      const storageData = Array(7).fill(0);
      const typeData = Array(7).fill().map(() => ({}));
      
      // Generate labels for the last 7 days
      const labels = Array(7).fill().map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
      // Get clips from last 7 days
      const recentClipsQuery = query(
        clipsRef,
        where("created_at", ">=", Timestamp.fromDate(sevenDaysAgo)),
        orderBy("created_at", "desc")
      );
      
      const clipsSnapshot = await getDocs(recentClipsQuery);
      
      clipsSnapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.created_at?.toDate();
        if (createdAt) {
          const daysAgo = Math.floor((now.toDate() - createdAt) / (1000 * 60 * 60 * 24));
          if (daysAgo >= 0 && daysAgo < 7) {
            // Count clips per day
            dailyData[daysAgo]++;
            
            // Track storage usage
            if (data.file_metadata) {
              const totalSize = data.file_metadata.reduce((acc, file) => acc + file.size, 0);
              storageData[daysAgo] += totalSize / (1024 * 1024); // Convert to MB
              
              // Track file types
              data.file_metadata.forEach(file => {
                const type = file.type.split('/')[0];
                typeData[daysAgo][type] = (typeData[daysAgo][type] || 0) + 1;
              });
            }
          }
        }
      });

      return {
        labels,
        clips: dailyData.reverse(),
        storage: storageData.reverse(),
        types: typeData.reverse()
      };
    } catch (error) {
      throw new Error(`Failed to get trends: ${error.message}`);
    }
  },

  async getExpiredClipsCount() {
    try {
      const clipsRef = collection(firestore, "clips");
      const now = Timestamp.now();
      
      const expiredQuery = query(
        clipsRef,
        where("expires_at", "<=", now)
      );

      const snapshot = await getDocs(expiredQuery);
      return snapshot.size;
    } catch (error) {
      console.error('Failed to get expired clips count:', error);
      throw new Error(`Failed to get expired clips count: ${error.message}`);
    }
  }
};