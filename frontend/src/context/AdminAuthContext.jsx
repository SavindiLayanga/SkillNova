import { useEffect, useMemo, useState } from "react";
import { AdminAuthContext } from "./adminAuthContextValue.js";
import { adminLoginApi, adminLogoutApi, getAdminMeApi, updateAdminProfileApi, updateAdminCredentialsApi } from "../services/adminAuthService.js";

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      try {
        const user = await getAdminMeApi();
        setAdminUser(user);
      } catch (error) {
        // Expected when no cookie or cookie expired
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

  const value = useMemo(() => {
    const isLoggedIn = !!adminUser;
    
    // In our simplified mock setup, we'll consider it a default password if they haven't explicitly changed it.
    // To implement a real check, the backend could return `hasDefaultPassword: true`.
    const isDefaultPassword = false;

    async function login(username, password) {
      const data = await adminLoginApi(username, password);
      setAdminUser(data.user);
      return data;
    }

    async function logout() {
      try {
        await adminLogoutApi();
      } catch (e) {
        console.error("Logout error", e);
      } finally {
        setAdminUser(null);
      }
    }

    async function updateProfile(data) {
      const response = await updateAdminProfileApi(data);
      setAdminUser(response.user);
      return response;
    }

    async function changeCredentials(currentPassword, newUsername, newPassword, confirmPassword) {
      if (newPassword && newPassword !== confirmPassword) {
        throw new Error("New password and confirm password do not match");
      }
      const response = await updateAdminCredentialsApi({
        currentPassword,
        newUsername,
        newPassword
      });
      if (newUsername) {
        setAdminUser(prev => ({ ...prev, username: newUsername }));
      }
      return response;
    }

    return {
      adminUser,
      loading,
      isLoggedIn,
      isDefaultPassword,
      login,
      logout,
      updateProfile,
      changeCredentials,
    };
  }, [adminUser, loading]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
