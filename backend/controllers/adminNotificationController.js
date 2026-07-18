import { AdminNotification } from "../models/AdminNotification.js";
import { sendTestEmail } from "../services/emailService.js";

// @desc    Send a test critical email alert
// @route   POST /api/admin/notifications/test-email
// @access  Private (Admin)
export const testCriticalEmail = async (req, res) => {
  try {
    await sendTestEmail();
    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({ message: "Failed to send test email" });
  }
};
// @desc    Get all admin notifications
// @route   GET /api/admin/notifications
// @access  Private (Admin)
export const getNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/admin/notifications/:id/read
// @access  Private (Admin)
export const markAsRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/admin/notifications/read-all
// @access  Private (Admin)
export const markAllAsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private (Admin)
export const deleteNotification = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification removed" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};
