import { useMemo, useState } from "react";
import { AdminAuthContext } from "./adminAuthContextValue.js";

const ADMIN_USERNAME = "admin";
const DEFAULT_PASSWORD = "Admin@12345";
const ADMIN_PASSWORD_KEY = "skillnova_admin_password";
const ADMIN_PASSWORD_CHANGED_KEY = "skillnova_admin_password_changed";
const ADMIN_SESSION_KEY = "skillnova_admin_session";

function readAdminPassword() {
  return localStorage.getItem(ADMIN_PASSWORD_KEY) ?? DEFAULT_PASSWORD;
}

function readPasswordChanged() {
  const storedFlag = localStorage.getItem(ADMIN_PASSWORD_CHANGED_KEY);

  if (storedFlag !== null) {
    return storedFlag === "true";
  }

  const storedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
  return Boolean(storedPassword && storedPassword !== DEFAULT_PASSWORD);
}

function readAdminSession() {
  try {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function AdminAuthProvider({ children }) {
  const [adminPassword, setAdminPassword] = useState(() => readAdminPassword());
  const [passwordChanged, setPasswordChanged] = useState(() =>
    readPasswordChanged()
  );
  const [session, setSession] = useState(() => readAdminSession());

  const value = useMemo(() => {
    const isLoggedIn = session?.username === ADMIN_USERNAME;
    const isDefaultPassword = !passwordChanged;

    function login(username, password) {
      if (username.trim() !== ADMIN_USERNAME || password !== adminPassword) {
        throw new Error("Invalid admin username or password.");
      }

      const nextSession = {
        username: ADMIN_USERNAME,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);

      return {
        isDefaultPassword: !passwordChanged,
      };
    }

    function changePassword(currentPassword, newPassword, confirmPassword) {
      if (currentPassword !== adminPassword) {
        throw new Error("Current password is incorrect.");
      }

      if (!isStrongPassword(newPassword)) {
        throw new Error(
          "New password must be at least 8 characters and include uppercase, lowercase, number, and special character."
        );
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Confirm password does not match.");
      }

      localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
      localStorage.setItem(ADMIN_PASSWORD_CHANGED_KEY, "true");
      setAdminPassword(newPassword);
      setPasswordChanged(true);

      const nextSession = {
        username: ADMIN_USERNAME,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
    }

    function logout() {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      setSession(null);
    }

    return {
      adminUsername: ADMIN_USERNAME,
      changePassword,
      isDefaultPassword,
      passwordChanged,
      isLoggedIn,
      login,
      logout,
      session,
    };
  }, [adminPassword, passwordChanged, session]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
