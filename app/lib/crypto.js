export async function generateKeyPair() {
  if (typeof window === 'undefined') {
    throw new Error('Crypto operations can only be performed in browser environment');
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey
  };
}

export async function encryptData(data, publicKey) {
  if (typeof window === 'undefined') {
    throw new Error('Crypto operations can only be performed in browser environment');
  }

  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    data
  );

  return {
    data: encryptedData,
    iv,
    key
  };
}

export async function decryptData(encryptedData, key, iv) {
  if (typeof window === 'undefined') {
    throw new Error('Crypto operations can only be performed in browser environment');
  }

  return await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encryptedData
  );
} 