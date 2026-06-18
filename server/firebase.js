import admin from 'firebase-admin';

export function initializeFirebaseAdmin() {
  try {
    if (admin.apps.length > 0) return;

    // Use default credentials if provided by GOOGLE_APPLICATION_CREDENTIALS
    // Alternatively, load service account from env: FIREBASE_SERVICE_ACCOUNT_KEY
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with provided service account key.');
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY missing. Initializing Firebase Admin with default credentials if available.');
      admin.initializeApp();
    }
  } catch (err) {
    console.error('Error initializing Firebase Admin:', err);
  }
}

export const auth = admin.auth;
