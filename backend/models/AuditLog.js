import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  event: {
    type: String,
    required: true,
    enum: [
      "2FA_SETUP_STARTED",
      "2FA_ENABLED",
      "2FA_DISABLED",
      "2FA_LOGIN_SUCCESS",
      "2FA_LOGIN_FAILED",
      "RECOVERY_CODE_USED",
      "RECOVERY_CODE_INVALID"
    ]
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  success: {
    type: Boolean,
    required: true
  }
}, { timestamps: true });

export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
