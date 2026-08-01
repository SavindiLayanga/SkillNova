import jwt from "jsonwebtoken";
import { UserSettings } from "../models/UserSettings.js";

/**
 * Middleware to protect routes that require 2FA.
 * Must be used AFTER verifyToken (Firebase auth middleware).
 */
export const require2FA = async (req, res, next) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userSettings = await UserSettings.findOne({ userId });
    
    // If 2FA is disabled, allow access
    if (!userSettings || !userSettings.twoFactorAuth) {
      return next();
    }

    // 2FA is enabled, check for the session cookie
    const token = req.cookies["2fa_session"];
    if (!token) {
      return res.status(403).json({ code: "2FA_REQUIRED", message: "Two-Factor Authentication required" });
    }

    // Verify JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ code: "2FA_REQUIRED", message: "Invalid or expired 2FA session" });
      }
      
      // Additional check to ensure the cookie belongs to the current user
      if (decoded.uid !== userId) {
        return res.status(403).json({ code: "2FA_REQUIRED", message: "Invalid 2FA session for this user" });
      }
      
      // 2FA verified
      req.twoFactorSession = decoded;
      next();
    });
  } catch (error) {
    console.error("Error in require2FA middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
