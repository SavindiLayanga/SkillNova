import mongoose from 'mongoose';

const userNotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  isRead: { type: Boolean, default: false },
  link: { type: String },
}, { timestamps: true });

export const UserNotification = mongoose.model('UserNotification', userNotificationSchema);
