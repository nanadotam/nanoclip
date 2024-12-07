import { firestore } from "../../firestore";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

export const cleanupHistoryService = {
  async logCleanup(stats, detailedClipData) {
    const historyRef = collection(firestore, "cleanup_history");
    await addDoc(historyRef, {
      timestamp: new Date(),
      filesDeleted: stats.filesDeleted,
      storageFreed: stats.storageFreed,
      documentsDeleted: stats.documentsDeleted,
      errors: stats.errors,
      success: stats.errors.length === 0,
      // Detailed tracking data
      deletedClips: detailedClipData.map(clip => ({
        id: clip.id,
        createdAt: clip.created_at,
        expiresAt: clip.expires_at,
        files: clip.file_metadata.map(file => ({
          type: file.type,
          size: file.size,
          name: file.stored_name
        })),
        totalSize: clip.file_metadata.reduce((acc, file) => acc + file.size, 0)
      })),
      fileTypes: detailedClipData.reduce((acc, clip) => {
        clip.file_metadata.forEach(file => {
          const type = file.type.split('/')[0];
          acc[type] = (acc[type] || 0) + 1;
        });
        return acc;
      }, {}),
      totalStorageFreed: detailedClipData.reduce((acc, clip) => 
        acc + clip.file_metadata.reduce((sum, file) => sum + file.size, 0), 0)
    });
  },

  async getRecentHistory(limit = 10) {
    const historyRef = collection(firestore, "cleanup_history");
    const q = query(historyRef, orderBy("timestamp", "desc"), limit(limit));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate()
    }));
  }
}; 