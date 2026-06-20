import { useContext } from "react";
import { CVAnalysisContext } from "../context/cvAnalysisContextValue.js";

export default function useCVAnalysis() {
  const context = useContext(CVAnalysisContext);

  if (!context) {
    throw new Error("useCVAnalysis must be used inside CVAnalysisProvider");
  }

  return context;
}
