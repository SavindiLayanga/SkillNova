const API_BASE_URL = "http://localhost:5000/api/user/matches";

export const userMatchesService = {
  getJobMatches: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch job matches");
      return res.json();
    } catch (error) {
      console.error('Error fetching job matches:', error);
      throw error;
    }
  },

  getCourseMatches: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch course matches");
      return res.json();
    } catch (error) {
      console.error('Error fetching course matches:', error);
      throw error;
    }
  }
};

