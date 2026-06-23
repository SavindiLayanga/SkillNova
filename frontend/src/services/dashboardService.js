const API_BASE_URL = "http://localhost:5000/api/dashboard";

export async function fetchDashboardSummary(token) {
  const res = await fetch(`${API_BASE_URL}/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function fetchLatestAnalysis(token) {
  const res = await fetch(`${API_BASE_URL}/latest-analysis`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch latest analysis");
  return res.json();
}

export async function fetchSkillGaps(token) {
  const res = await fetch(`${API_BASE_URL}/skill-gaps`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch skill gaps");
  return res.json();
}

export async function fetchLearningPath(token) {
  const res = await fetch(`${API_BASE_URL}/learning-path`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch learning path");
  return res.json();
}

export async function fetchRecentTests(token) {
  const res = await fetch(`${API_BASE_URL}/recent-tests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch recent tests");
  return res.json();
}
