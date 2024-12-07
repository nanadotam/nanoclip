import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      clientEmail: process.env.REACT_APP_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.REACT_APP_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminDb = getFirestore(); 