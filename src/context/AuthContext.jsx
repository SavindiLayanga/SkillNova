import { useMemo, useState } from "react";
import { AuthContext } from "./authContextValue.js";

const USERS_KEY = "skillnova_users";
const SESSION_KEY = "skillnova_session";

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getStoredUsers() {
  return readJson(USERS_KEY, []);
}

function toText(value) {
  return typeof value === "string" ? value : "";
}

function getStoredSessionUser() {
  const session = readJson(SESSION_KEY, null);

  if (!session?.email) {
    return null;
  }

  return (
    getStoredUsers().find(
      (storedUser) => storedUser.email === session.email.toLowerCase()
    ) ?? null
  );
}

function withoutPassword(user) {
  if (!user) {
    return null;
  }

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => withoutPassword(getStoredSessionUser()));

  const value = useMemo(() => {
    function signup(details) {
      const email = toText(details.email).trim().toLowerCase();
      const users = getStoredUsers();
      const exists = users.some((storedUser) => storedUser.email === email);

      if (exists) {
        throw new Error("An account already exists for this email.");
      }

      const newUser = {
        id: crypto.randomUUID?.() ?? `${Date.now()}`,
        name: toText(details.name).trim(),
        email,
        password: toText(details.password),
        targetRole: toText(details.targetRole).trim(),
        experience: toText(details.experience).trim(),
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
      setUser(withoutPassword(newUser));

      return withoutPassword(newUser);
    }

    function signin(emailInput, passwordInput) {
      const email = toText(emailInput).trim().toLowerCase();
      const password = toText(passwordInput);
      const matchedUser = getStoredUsers().find(
        (storedUser) =>
          storedUser.email === email && storedUser.password === password
      );

      if (!matchedUser) {
        throw new Error("Wrong email or password. Please try again.");
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
      setUser(withoutPassword(matchedUser));

      return withoutPassword(matchedUser);
    }

    function logout() {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
    }

    return {
      isAuthenticated: Boolean(user),
      logout,
      signin,
      signup,
      user,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
