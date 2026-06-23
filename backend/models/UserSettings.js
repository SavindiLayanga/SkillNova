import mongoose from "mongoose";

const UserSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  emailCourseRecommendations: { type: Boolean, default: true },
  showRemoteJobsFirst: { type: Boolean, default: true },
  useCVDataForMatchScoring: { type: Boolean, default: true },
  prioritizeBeginnerFriendlyPaths: { type: Boolean, default: false },
  weeklyProgressReminders: { type: Boolean, default: true },
  newJobMatchAlerts: { type: Boolean, default: true },
  skillTestAvailabilityAlerts: { type: Boolean, default: true },
  courseCompletionReminders: { type: Boolean, default: false },
  cvAnalysisStorage: { type: Boolean, default: true },
  personalizedRecommendations: { type: Boolean, default: true },
  progressVisibility: { type: Boolean, default: true },
  accountActivity: { type: Boolean, default: true },
}, { timestamps: true });

export const UserSettings = mongoose.model("UserSettings", UserSettingsSchema);
