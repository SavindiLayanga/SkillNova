const API_BASE_URL = "http://localhost:5000/api/job-readiness";

export const jobReadinessService = {
  getReadiness: async (token) => {
    const res = await fetch(`${API_BASE_URL}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch readiness");
    return res.json();
  },

  evaluateReadiness: async (token) => {
    const res = await fetch(`${API_BASE_URL}/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to evaluate readiness");
    return res.json();
  },

  getCertificates: async (token) => {
    const res = await fetch(`${API_BASE_URL}/certificates`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch certificates");
    return res.json();
  },

  getIntroductions: async (token) => {
    const res = await fetch(`${API_BASE_URL}/introductions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch introductions");
    return res.json();
  },

  getAppliedJobIds: async (token) => {
    const res = await fetch(`${API_BASE_URL}/applied-job-ids`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch applied jobs");
    return res.json();
  },

  previewApplication: async (jobId, token) => {
    const res = await fetch(`${API_BASE_URL}/preview-application/${jobId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate application preview");
    }
    return res.json();
  },

  applyToJob: async (jobId, coverLetter, token) => {
    const res = await fetch(`${API_BASE_URL}/apply/${jobId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ coverLetter })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to send application");
    }
    return res.json();
  }
};
