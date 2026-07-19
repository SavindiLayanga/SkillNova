const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function adminLoginApi(username, password) {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

export async function adminLogoutApi() {
  const response = await fetch(`${API_URL}/admin/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Logout failed");
  }

  return data;
}

export async function getAdminMeApi() {
  const response = await fetch(`${API_URL}/admin/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch admin profile");
  }

  return data;
}

export async function updateAdminProfileApi(profileData) {
  const response = await fetch(`${API_URL}/admin/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update profile");
  }

  return data;
}
