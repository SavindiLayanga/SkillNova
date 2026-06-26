import { useEffect, useState, useCallback, useMemo } from "react";
import { PracticeContext } from "./practiceContextValue.js";
import { fetchSkillTests, fetchCurrentPractice, updateCurrentPractice, clearCurrentPractice } from "../services/aiService.js";
import useAuth from "../hooks/useAuth.js";

export function PracticeProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Reconstructed from backend test history
  const [completedTests, setCompletedTests] = useState({});
  const [pathScores, setPathScores] = useState({});
  const [dynamicTestsCache, setDynamicTestsCache] = useState({});
  
  // Active practice session
  const [activeSession, setActiveSession] = useState(null);
  
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const [tests, practice] = await Promise.all([
        fetchSkillTests(),
        fetchCurrentPractice()
      ]);
      
      // Reconstruct caches
      const newCompleted = {};
      const newPathScores = {};
      const newDynamicCache = {};
      
      if (Array.isArray(tests)) {
        tests.forEach(test => {
          if (!test.skillName) return;
          
          // Reconstruct dynamicTestsCache
          const type = test.difficulty || "quiz"; // naive mapping, adjust if needed
          if (!newDynamicCache[test.skillName]) newDynamicCache[test.skillName] = {};
          newDynamicCache[test.skillName][type] = test;
          
          if (test.isCompleted) {
            // Assume it's a general test if no pathType is easily derived, or map based on your app's logic
            // For now, we will store them. 
            // In SkillTests.jsx, pathScores uses [skillName][type] = score
            if (!newPathScores[test.skillName]) newPathScores[test.skillName] = {};
            newPathScores[test.skillName][type] = test.score;
            
            // Also store in general completed just in case
            newCompleted[test.skillName] = test.score;
          }
        });
      }
      
      setCompletedTests(newCompleted);
      setPathScores(newPathScores);
      setDynamicTestsCache(newDynamicCache);
      
      if (practice && practice.selectedTest) {
        setActiveSession(practice);
      } else {
        setActiveSession(null);
      }
    } catch (error) {
      console.error("Failed to load practice state:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSession = useCallback(async (updates) => {
    // Optimistic update locally
    setActiveSession(prev => prev ? { ...prev, ...updates } : updates);
    try {
      await updateCurrentPractice(updates);
    } catch (e) {
      console.error("Failed to sync practice session", e);
    }
  }, []);

  const clearSession = useCallback(async () => {
    setActiveSession(null);
    try {
      await clearCurrentPractice();
    } catch (e) {
      console.error("Failed to clear practice session", e);
    }
  }, []);

  const refreshTests = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const value = useMemo(() => ({
    loading,
    completedTests,
    pathScores,
    dynamicTestsCache,
    activeSession,
    updateSession,
    clearSession,
    refreshTests
  }), [loading, completedTests, pathScores, dynamicTestsCache, activeSession, updateSession, clearSession, refreshTests]);

  return (
    <PracticeContext.Provider value={value}>
      {children}
    </PracticeContext.Provider>
  );
}
