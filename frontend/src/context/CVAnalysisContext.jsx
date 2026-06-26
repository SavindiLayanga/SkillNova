import { useCallback, useEffect, useMemo, useState } from "react";
import { CVAnalysisContext } from "./cvAnalysisContextValue.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { extractTextFromDOCX } from "../utils/docxParser.js";
import { analyzeCV, analyzeManualSkills } from "../services/aiService.js";
import useAuth from "../hooks/useAuth.js";
import { fetchLatestAnalysis } from "../services/dashboardService.js";

const STORAGE_KEY = "skillnova_cv_analysis";

function readStoredAnalysis() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored);
    const data = parsed?.analysisData ? parsed.analysisData : null;
    
    // Purge residual mock data from local storage
    if (data && data.name && typeof data.name === "string" && data.name.includes("Mock")) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

export function CVAnalysisProvider({ children }) {
  const { user, getToken } = useAuth();
  const [storedAnalysis] = useState(() => readStoredAnalysis());
  const [status, setStatus] = useState(storedAnalysis ? "analyzed" : "initializing");
  const [analysis, setAnalysis] = useState(() => {
    if (!storedAnalysis) return null;
    return storedAnalysis;
  });
  const [fileName, setFileName] = useState(storedAnalysis?.fileName ?? "");
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function syncAnalysis() {
      if (!user) {
        if (isMounted && !storedAnalysis) setStatus("noCV");
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          if (isMounted && !storedAnalysis) setStatus("noCV");
          return;
        }
        const latest = await fetchLatestAnalysis(token);
        if (isMounted) {
          if (latest && Object.keys(latest).length > 0) {
            setAnalysis(latest);
            setStatus("analyzed");
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ analysisData: latest }));
          } else if (!storedAnalysis) {
            setStatus("noCV");
          }
        }
      } catch (err) {
        console.error("Failed to sync analysis from backend", err);
        if (isMounted && !storedAnalysis) {
          setStatus("noCV");
        }
      }
    }
    syncAnalysis();
    return () => { isMounted = false; };
  }, [user, getToken, storedAnalysis]);

  const startAnalysis = useCallback(async (file) => {
    if (!file) {
      setError("File is required.");
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setAnalysis(null);
    setFileName(file.name);
    setStatus("uploading");
    setError(null);

    try {
      // 1. Extract text based on file type
      let text = "";
      if (file.name.toLowerCase().endsWith(".pdf")) {
        text = await extractTextFromPDF(file);
      } else if (file.name.toLowerCase().endsWith(".docx") || file.name.toLowerCase().endsWith(".doc")) {
        text = await extractTextFromDOCX(file);
      } else {
        throw new Error("Unsupported file format. Please upload PDF or DOCX.");
      }
      
      setStatus("analyzing");
      
      // 2. Analyze with AI
      const extractedData = await analyzeCV(text);

      // 3. Create full analysis object directly using the AI output
      const fullAnalysis = {
        analyzedAt: new Date().toISOString(),
        fileName: file.name,
        targetRole: extractedData.targetRole || "Software Developer",
        name: extractedData.name || "",
        email: extractedData.email || "",
        technicalSkills: extractedData.technicalSkills || [],
        softSkills: extractedData.softSkills || [],
        extracted: {
          experience: extractedData.experience || [],
          education: extractedData.education || [],
          certifications: extractedData.certifications || [],
          skills: extractedData.skills || [],
          projects: extractedData.projects || [],
        },
        careerRecommendations: extractedData.careerRecommendations || [],
        missingSkills: extractedData.missingSkills || [],
        skillMatchScore: extractedData.skillMatchScore || 0,
        cvScore: extractedData.cvScore || 0,
        learningPath: extractedData.learningPath || [],
        aiInsights: extractedData.aiInsights || "No specific insights generated.",
        
        // We no longer inject dummy data, all UI should handle missing/empty state
        jobMatches: extractedData.jobMatches || [],
      };

      // 4. Save to state and storage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          analysisData: fullAnalysis,
        })
      );
      setAnalysis(fullAnalysis);
      setStatus("analyzed");

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to analyze CV.");
      setStatus("noCV");
    }
  }, []);

  const startManualAnalysis = useCallback(async (name, skills, targetRole, experience, education) => {
    if (!skills || !targetRole || !name) {
      setError("Name, Skills, and Target Role are required.");
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setAnalysis(null);
    setFileName("Manual Entry");
    setStatus("analyzing");
    setError(null);

    try {
      const extractedData = await analyzeManualSkills(name, skills, targetRole, experience, education);

      const fullAnalysis = {
        analyzedAt: new Date().toISOString(),
        fileName: "Manual Entry",
        targetRole: extractedData.targetRole || targetRole,
        name: extractedData.name || name || "SkillNova User",
        email: "",
        technicalSkills: extractedData.technicalSkills || [],
        softSkills: extractedData.softSkills || [],
        extracted: {
          experience: [],
          education: [],
          certifications: [],
          skills: extractedData.extracted?.skills || skills.split(","),
          projects: [],
        },
        careerRecommendations: extractedData.careerRecommendations || [],
        missingSkills: extractedData.missingSkills || [],
        skillMatchScore: extractedData.skillMatchScore || 0,
        cvScore: extractedData.cvScore || 0,
        learningPath: extractedData.learningPath || [],
        aiInsights: extractedData.aiInsights || "No specific insights generated.",
        
        // We no longer inject dummy data, all UI should handle missing/empty state
        jobMatches: extractedData.jobMatches || [],
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          analysisData: fullAnalysis,
        })
      );
      setAnalysis(fullAnalysis);
      setStatus("analyzed");

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate analysis.");
      setStatus("noCV");
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAnalysis(null);
    setFileName("");
    setStatus("noCV");
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      analysis,
      fileName,
      hasAnalysis: status === "analyzed" && Boolean(analysis),
      resetAnalysis,
      startAnalysis,
      startManualAnalysis,
      status,
      error,
    }),
    [analysis, fileName, resetAnalysis, startAnalysis, startManualAnalysis, status, error]
  );

  return (
    <CVAnalysisContext.Provider value={value}>
      {children}
    </CVAnalysisContext.Provider>
  );
}
