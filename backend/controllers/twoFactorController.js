import speakeasy from "speakeasy";
import qrcode from "qrcode";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserSettings } from "../models/UserSettings.js";
import { encryptText, decryptText } from "../utils/encryption.js";
import { logAudit } from "../utils/auditLogger.js";

// Utility to hash recovery codes
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Generate recovery codes
const generateRecoveryCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString("hex").toUpperCase()); // e.g., 'A8F2-KQ9M' format roughly, we'll just do 8 hex chars
  }
  return codes;
};

// Setup 2FA (Generate secret and QR)
export const setup2FA = async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let userSettings = await UserSettings.findOne({ userId });
    if (!userSettings) {
      userSettings = await UserSettings.create({ userId });
    }

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `SkillNova (${req.user.email || userId})`,
    });

    // Encrypt and save (but don't enable yet)
    userSettings.twoFactorSecret = encryptText(secret.base32);
    // Do not set twoFactorAuth to true until verified!
    await userSettings.save();

    // Generate QR Code
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    logAudit({ userId, event: "2FA_SETUP_STARTED", success: true, req });

    res.status(200).json({
      qrCode: qrCodeDataUrl,
      manualKey: secret.base32
    });

  } catch (error) {
    console.error("Error setting up 2FA:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify 2FA and Enable
export const verify2FA = async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { token } = req.body;
    
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!token) return res.status(400).json({ message: "Token is required" });

    const userSettings = await UserSettings.findOne({ userId });
    if (!userSettings || !userSettings.twoFactorSecret) {
      return res.status(400).json({ message: "2FA setup not initiated" });
    }

    const decryptedSecret = decryptText(userSettings.twoFactorSecret);
    
    const isValid = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: "base32",
      token,
      window: 1 // handle clock drift
    });

    if (!isValid) {
      logAudit({ userId, event: "2FA_LOGIN_FAILED", success: false, req });
      return res.status(400).json({ message: "Invalid token" });
    }

    // Generate and hash recovery codes
    const plainCodes = generateRecoveryCodes();
    const hashedCodes = plainCodes.map(code => hashToken(code));

    userSettings.twoFactorAuth = true;
    userSettings.twoFactorEnabledAt = new Date();
    userSettings.twoFactorRecoveryCodes = hashedCodes;
    await userSettings.save();

    // Issue Session Cookie
    const sessionToken = jwt.sign(
      { uid: userId, twoFactor: true },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.cookie("2fa_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    logAudit({ userId, event: "2FA_ENABLED", success: true, req });

    res.status(200).json({
      success: true,
      message: "Two-Factor Authentication enabled successfully",
      recoveryCodes: plainCodes // Return plain codes ONCE
    });

  } catch (error) {
    console.error("Error verifying 2FA:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const userSettings = await UserSettings.findOne({ userId });
    if (userSettings) {
      userSettings.twoFactorAuth = false;
      userSettings.twoFactorSecret = null;
      userSettings.twoFactorEnabledAt = null;
      userSettings.twoFactorRecoveryCodes = [];
      await userSettings.save();
    }

    // Clear cookie
    res.clearCookie("2fa_session");

    logAudit({ userId, event: "2FA_DISABLED", success: true, req });

    res.status(200).json({ success: true, message: "Two-Factor Authentication disabled" });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Validate Session during Login flow
export const validateSession = async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { token } = req.body;
    
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!token) return res.status(400).json({ message: "Token is required" });

    const userSettings = await UserSettings.findOne({ userId });
    if (!userSettings || !userSettings.twoFactorAuth || !userSettings.twoFactorSecret) {
      return res.status(400).json({ message: "2FA is not enabled for this account" });
    }

    const decryptedSecret = decryptText(userSettings.twoFactorSecret);
    
    // First try TOTP
    let isValid = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: "base32",
      token,
      window: 1
    });

    if (isValid) {
      logAudit({ userId, event: "2FA_LOGIN_SUCCESS", success: true, req });
    } else {
      // Try Recovery Code
      const hashedAttempt = hashToken(token);
      const codeIndex = userSettings.twoFactorRecoveryCodes.indexOf(hashedAttempt);
      
      if (codeIndex !== -1) {
        // Valid recovery code used
        isValid = true;
        // Invalidate the code
        userSettings.twoFactorRecoveryCodes.splice(codeIndex, 1);
        await userSettings.save();
        logAudit({ userId, event: "RECOVERY_CODE_USED", success: true, req });
      } else {
        logAudit({ userId, event: "RECOVERY_CODE_INVALID", success: false, req });
      }
    }

    if (!isValid) {
      return res.status(400).json({ message: "Invalid token or recovery code" });
    }

    // Issue Session Cookie
    const sessionToken = jwt.sign(
      { uid: userId, twoFactor: true },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.cookie("2fa_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 8 * 60 * 60 * 1000
    });

    res.status(200).json({ success: true, message: "Verification successful" });

  } catch (error) {
    console.error("Error validating session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
