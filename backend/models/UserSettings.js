import mongoose from "mongoose";

const UserSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  preferences: {
    language: { type: String, default: "en" },
    timezone: { type: String, default: "" },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    timeFormat: { type: String, default: "12h" },
    theme: { type: String, default: "system" },
    currency: { type: String, default: "LKR" }
  },
  emailCourseRecommendations: { type: Boolean, default: true },
  showRemoteJobsFirst: { type: Boolean, default: true },
  useCVDataForMatchScoring: { type: Boolean, default: true },
  prioritizeBeginnerFriendlyPaths: { type: Boolean, default: false },
  
  // Notification Preferences
  newJobMatchAlerts: { type: Boolean, default: true },
  courseRecommendations: { type: Boolean, default: true },
  cvReviewUpdates: { type: Boolean, default: true },
  skillAssessmentResults: { type: Boolean, default: true },
  learningProgressReminders: { type: Boolean, default: true },
  courseCompletionReminders: { type: Boolean, default: false },
  weeklyCareerDigest: { type: Boolean, default: true },
  securityAlerts: { type: Boolean, default: true },
  announcementsNewFeatures: { type: Boolean, default: false },

  // Communication Settings (Delivery)
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: false },
  smsNotifications: { type: Boolean, default: false },

  // Frequency & Timing
  notificationFrequency: { type: String, default: "Real-time" },
  quietHoursStart: { type: String, default: "22:00" },
  quietHoursEnd: { type: String, default: "07:00" },

  // Legacy/Other Privacy Settings
  weeklyProgressReminders: { type: Boolean, default: true },
  skillTestAvailabilityAlerts: { type: Boolean, default: true },
  cvAnalysisStorage: { type: Boolean, default: true },
  personalizedRecommendations: { type: Boolean, default: true },
  progressVisibility: { type: Boolean, default: true },
  accountActivity: { type: Boolean, default: true },
  
  // Two-Factor Authentication (2FA) fields
  twoFactorAuth: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null },
  twoFactorEnabledAt: { type: Date, default: null },
  twoFactorRecoveryCodes: { type: [String], default: [] },
}, { timestamps: true });

export const UserSettings = mongoose.model("UserSettings", UserSettingsSchema, "settings");
