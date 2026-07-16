import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api/admin/jobs`,
  withCredentials: true,
});

export const adminJobsService = {
  getJobs: async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/', jobData);
    return response.data;
  },

  updateJob: async (id, updates) => {
    const response = await api.patch(`/${id}`, updates);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  importJobs: async () => {
    const response = await api.post('/import');
    return response.data;
  },

  importLinkedInJobs: async (keyword, location) => {
    const response = await api.post('/import/linkedin', { keyword, location });
    return response.data;
  }
};
