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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          // Keep a ref to the original object to get token
          _firebaseUser: firebaseUser,
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
        return userCredential.user;
      } catch {
        throw new Error("Wrong email or password. Please try again.");
      }
    }

    async function logout() {
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
      signin,
      signup,
      user,
      getToken
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
