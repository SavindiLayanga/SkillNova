import { AuditLog } from "../models/AuditLog.js";

/**
 * Logs a security event related to 2FA
 * @param {Object} params
 * @param {String} params.userId - The ID of the user
 * @param {String} params.event - The event type (e.g., 2FA_ENABLED, 2FA_LOGIN_SUCCESS)
 * @param {Boolean} params.success - Whether the event was successful
 * @param {Object} [params.req] - Optional express request object to extract IP and user agent
 */
export const logAudit = async ({ userId, event, success, req }) => {
  try {
    const logData = {
      userId,
      event,
      success,
    };

    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get("user-agent") || "unknown";
    }

    await AuditLog.create(logData);
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
};
