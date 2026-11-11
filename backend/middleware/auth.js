import { getFirebaseAuth } from '../firebase.js';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

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

    // 1. Verify token with Firebase Admin
    let decodedToken;
    try {
      decodedToken = await getFirebaseAuth().verifyIdToken(token);
    } catch (err) {
      console.error('Error verifying Firebase ID token:', err.message || err);
      const isExpired = err.code === 'auth/id-token-expired';
      return res.status(401).json({ 
        error: isExpired 
          ? 'Your session has expired. Please log out and log in again.' 
          : `Unauthorized: Invalid token (${err.message || 'Verification failed'})`
      });
    }

    // 2. Check MongoDB status safely
    try {
      const dbUser = await User.findOne({ uid: decodedToken.uid });
      if (dbUser) {
        if (dbUser.isDeleted) {
          return res.status(403).json({ error: 'Your account has been deleted.' });
        }
        if (!dbUser.isActive) {
          return res.status(403).json({ error: 'Your account has been disabled by an administrator.' });
        }
      }
    } catch (dbErr) {
      console.warn('Warning: Could not fetch user from DB in auth middleware:', dbErr.message);
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    // CSRF Protection: Verify Origin/Referer for state-changing requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const origin = req.headers.origin;
      const expectedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      // Strict origin validation
      if (origin !== expectedOrigin) {
        console.warn(`CSRF attempt detected from origin: ${origin}`);
        return res.status(403).json({ error: 'Forbidden: Invalid Origin' });
      }
    }

    const token = req.cookies?.admin_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillnova_fallback_jwt_secret_dev');
      req.user = decoded;
      
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Admin access required.' });
      }

      next();
    } catch (err) {
      console.error('Error verifying Admin JWT token:', err.message);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Admin Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
