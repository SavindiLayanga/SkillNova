import { useEffect, useMemo, useState } from "react";
import { AdminAuthContext } from "./adminAuthContextValue.js";
import { adminLoginApi, adminLogoutApi, getAdminMeApi } from "../services/adminAuthService.js";

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

    return {
      adminUser,
      loading,
      isLoggedIn,
      login,
      logout,
    };
  }, [adminUser, loading]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
