import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

const adminNotificationService = {
  getNotifications: async () => {
    const response = await api.get("/admin/notifications");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/admin/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/admin/notifications/read-all");
    return response.data;
  },
  
  deleteNotification: async (id) => {
    const response = await api.delete(`/admin/notifications/${id}`);
    return response.data;
  }
};

export default adminNotificationService;
