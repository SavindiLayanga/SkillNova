const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchDashboardStats() {
  const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch dashboard stats');
  return data;
}
