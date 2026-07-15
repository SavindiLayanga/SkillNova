const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchAllUsers(params) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/admin/users?${query}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch users');
  return data;
}

export async function fetchUserDetails(id) {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch user details');
  return data;
}

export async function updateUserStatus(id, isActive) {
  const response = await fetch(`${API_URL}/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ isActive })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update user status');
  return data;
}

export async function updateUser(id, payload) {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update user');
  return data;
}

export async function deleteUser(id) {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to delete user');
  return data;
}
