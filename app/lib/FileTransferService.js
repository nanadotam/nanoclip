class FileTransferService {
  static CHUNK_SIZE = 16384; // 16KB chunks

  static async chunkFile(file) {
    const chunks = [];
    let offset = 0;
    
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + this.CHUNK_SIZE);
      const buffer = await chunk.arrayBuffer();
      chunks.push(buffer);
      offset += this.CHUNK_SIZE;
    }
    
    return chunks;
  }

  static async assembleFile(chunks, metadata) {
    const blob = new Blob(chunks, { type: metadata.type });
    return new File([blob], metadata.name, { type: metadata.type });
  }

  static calculateProgress(current, total) {
    return Math.floor((current / total) * 100);
  }

  static async hashFile(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export default FileTransferService; 