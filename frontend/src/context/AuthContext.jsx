import { useEffect, useMemo, useState } from "react";
import Loader from "../components/ui/Loader.jsx";
import { auth } from "../config/firebase.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { AuthContext } from "./authContextValue.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem("skillnova_multi_accounts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveAccountsList = (accounts) => {
    setSavedAccounts(accounts);
    try {
      localStorage.setItem("skillnova_multi_accounts", JSON.stringify(accounts));
    } catch (e) {
      console.warn("Could not save multi accounts to storage:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profileName = firebaseUser.displayName || "";
        let targetRole = "";
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch("/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const profile = await res.json();
            if (profile?.name) profileName = profile.name;
            if (profile?.targetRole) targetRole = profile.targetRole;
          }
        } catch (e) {
          console.warn("Could not fetch user profile:", e);
        }

        const activeUserObj = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: profileName || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          targetRole: targetRole || "Software Developer",
          _firebaseUser: firebaseUser,
        };

        setUser(activeUserObj);

        // Keep savedAccounts synchronized with current active user details
        setSavedAccounts((prev) => {
          const existing = prev.find(
            (a) => a.email.toLowerCase() === firebaseUser.email.toLowerCase()
          );
          const updatedItem = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: activeUserObj.name,
            targetRole: activeUserObj.targetRole,
            password: existing?.password || "",
            lastUsed: Date.now(),
          };
          const newList = [
            updatedItem,
            ...prev.filter(
              (a) => a.email.toLowerCase() !== firebaseUser.email.toLowerCase()
            ),
          ];
          try {
            localStorage.setItem("skillnova_multi_accounts", JSON.stringify(newList));
          } catch (e) {}
          return newList;
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = useMemo(() => {
    async function signup(details) {
      try {
        // Clear local storage for a fresh start
        localStorage.removeItem("skillnova_cv_analysis");
        localStorage.removeItem("preferences");

        const userCredential = await createUserWithEmailAndPassword(auth, details.email, details.password);
        
        // After firebase signup, we notify our backend to create/upsert the MongoDB profile
        const token = await userCredential.user.getIdToken();
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: details.name })
        });
        
        return userCredential.user;
      } catch (error) {
        throw new Error(error.message);
      }
    }

    async function signin(emailInput, passwordInput) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        
        // Remember in saved accounts list with password for instant 1-click switching
        setSavedAccounts((prev) => {
          const updated = [
            {
              uid: userCredential.user.uid,
              email: emailInput,
              name: userCredential.user.displayName || emailInput.split("@")[0],
              targetRole: "Software Developer",
              password: passwordInput,
              lastUsed: Date.now()
            },
            ...prev.filter((a) => a.email.toLowerCase() !== emailInput.toLowerCase())
          ];
          try {
            localStorage.setItem("skillnova_multi_accounts", JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });

        return userCredential.user;
      } catch {
        throw new Error("Wrong email or password. Please try again.");
      }
    }

    async function addAccount(emailInput, passwordInput) {
      // Clear current analysis cache so next user loads their own data
      localStorage.removeItem("skillnova_cv_analysis");
      localStorage.removeItem("preferences");
      return await signin(emailInput, passwordInput);
    }

    async function switchAccount(targetEmail, optionalPassword) {
      const account = savedAccounts.find(
        (a) => a.email.toLowerCase() === targetEmail.toLowerCase()
      );
      if (!account) throw new Error("Account not found");

      const pwd = optionalPassword || account.password;
      if (!pwd) {
        throw new Error("PASSWORD_REQUIRED");
      }

      // Clear analysis cache before switching
      localStorage.removeItem("skillnova_cv_analysis");
      localStorage.removeItem("preferences");

      const userCredential = await signInWithEmailAndPassword(auth, account.email, pwd);
      
      // Update password if it was entered
      if (optionalPassword) {
        setSavedAccounts((prev) => {
          const updated = prev.map((a) => 
            a.email.toLowerCase() === targetEmail.toLowerCase() ? { ...a, password: optionalPassword } : a
          );
          try {
            localStorage.setItem("skillnova_multi_accounts", JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }

      return userCredential.user;
    }

    async function removeAccount(emailToRemove) {
      const remaining = savedAccounts.filter(
        (a) => a.email.toLowerCase() !== emailToRemove.toLowerCase()
      );
      saveAccountsList(remaining);

      // If removed account was the currently active user, switch to next available or logout
      if (user?.email?.toLowerCase() === emailToRemove.toLowerCase()) {
        if (remaining.length > 0 && remaining[0].password) {
          try {
            await switchAccount(remaining[0].email);
          } catch {
            await logout();
          }
        } else {
          await logout();
        }
      }
    }

    async function logout() {
      localStorage.removeItem("skillnova_cv_analysis");
      localStorage.removeItem("preferences");
      await signOut(auth);
    }

    async function logoutAll() {
      localStorage.removeItem("skillnova_multi_accounts");
      localStorage.removeItem("skillnova_cv_analysis");
      localStorage.removeItem("preferences");
      setSavedAccounts([]);
      await signOut(auth);
    }

    // Helper to get token for API requests
    async function getToken() {
      if (!auth.currentUser) return null;
      return await auth.currentUser.getIdToken();
    }

    return {
      isAuthenticated: Boolean(user),
      loading,
      logout,
      logoutAll,
      signin,
      signup,
      user,
      getToken,
      savedAccounts,
      addAccount,
      switchAccount,
      removeAccount
    };
  }, [user, loading]);

  // Don't render children until we have finished checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading your session..." secondaryText="Please wait..." />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
