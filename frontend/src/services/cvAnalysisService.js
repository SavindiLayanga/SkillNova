const API_BASE_URL = "http://localhost:5000/api/user";

export async function getAllAnalyses(token) {
  const res = await fetch(`${API_BASE_URL}/all-analyses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch analyses history");
  return res.json();
}

export async function getCVAnalyses(token) {
  const res = await fetch(`${API_BASE_URL}/cv-analyses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch CV analyses");
  return res.json();
}

export async function deleteCVAnalysis(id, token) {
  const res = await fetch(`${API_BASE_URL}/cv-analyses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to delete CV analysis");
  return res.json();
}

export async function deleteManualAnalysis(id, token) {
  const res = await fetch(`${API_BASE_URL}/manual-analyses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to delete Manual analysis");
  return res.json();
}
