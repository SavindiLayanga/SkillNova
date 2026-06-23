import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export function initializeFirebaseAdmin() {
  try {
    if (!getApps().length) {
      // Use default credentials if provided by GOOGLE_APPLICATION_CREDENTIALS
      // Alternatively, load service account from env: FIREBASE_SERVICE_ACCOUNT_KEY
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        initializeApp({
          credential: cert(serviceAccount)
        });
        console.log('Firebase Admin initialized with provided service account key.');
      } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY missing. Initializing Firebase Admin with default credentials if available.');
        initializeApp({ projectId: 'skillnova-263e1' });
      }
    }
  } catch (err) {
    console.error('Error initializing Firebase Admin:', err);
  }
}

export function getFirebaseAuth() {
  return getAuth();
}
