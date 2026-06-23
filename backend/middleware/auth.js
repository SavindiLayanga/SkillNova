import { getFirebaseAuth } from '../firebase.js';

export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    // Verify token with Firebase Admin
    // Note: If Firebase Admin is not properly initialized with credentials (e.g. in dev), 
    // this will fail. For local dev without proper service accounts, one might mock this.
    try {
      const decodedToken = await getFirebaseAuth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      };
      next();
    } catch (err) {
      console.error('Error verifying Firebase ID token:', err);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
