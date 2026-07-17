import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api/admin/courses`,
  withCredentials: true,
});

export const adminCoursesService = {
  getCourses: async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await api.post('/', courseData);
    return response.data;
  },

  updateCourse: async (id, updates) => {
    const response = await api.patch(`/${id}`, updates);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  bulkAction: async (actionData) => {
    // actionData = { courseIds: [], action: 'Archive' | 'Publish' | 'Delete' }
    const response = await api.patch('/bulk-action', actionData);
    return response.data;
  }
};
