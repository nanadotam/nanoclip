import crypto from 'crypto';

export const encryption = {
  // Generate a secure key from password
  generateKey(password) {
    return crypto.createHash('sha256').update(password).digest();
  },

  // Encrypt file chunks before sending
  encryptChunk(chunk, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
    return { iv, encrypted };
  },

  // Decrypt received chunks
  decryptChunk(encryptedData, key, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  },

  // Generate random session key
  generateSessionKey() {
    return crypto.randomBytes(32);
  }
}; 