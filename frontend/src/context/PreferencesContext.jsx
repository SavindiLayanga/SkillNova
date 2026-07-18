import { createContext, useState, useEffect, useContext } from 'react';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      // 1. Try DB first (Assuming the token is sent in cookies for verifyAuth)
      const res = await fetch('/api/preferences', {
        headers: {
          'Content-Type': 'application/json',
          // Assuming authorization happens via cookies or you may need to add Authorization header
        },
      });

      if (res.ok) {
        const dbPrefs = await res.json();
        setPreferences(dbPrefs);
        localStorage.setItem("preferences", JSON.stringify(dbPrefs));
      } else {
        throw new Error("Failed to fetch preferences");
      }
    } catch (error) {
      console.warn("Could not fetch DB preferences, falling back to localStorage", error);
      
      // 2. Try localStorage
      const saved = localStorage.getItem("preferences");
      
      if (saved) {
        setPreferences(JSON.parse(saved));
      } else {
        // 3. Fallback to Browser Default
        const defaultPrefs = {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: "en",
          dateFormat: "DD/MM/YYYY",
          timeFormat: "12h",
          theme: "light",
          currency: "LKR"
        };
        setPreferences(defaultPrefs);
        localStorage.setItem("preferences", JSON.stringify(defaultPrefs));
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPrefs) => {
    const updated = { ...preferences, ...newPrefs };
    // Optimistic update
    setPreferences(updated);
    localStorage.setItem("preferences", JSON.stringify(updated));

    try {
      await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrefs),
      });
    } catch (error) {
      console.error("Failed to sync preferences to DB", error);
    }
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};
