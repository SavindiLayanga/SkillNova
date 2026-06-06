import { Navigate, Outlet, useLocation } from "react-router-dom";
import useCVAnalysis from "../../hooks/useCVAnalysis.js";

export default function RequireCVRoute() {
  const { hasAnalysis } = useCVAnalysis();
  const location = useLocation();

  if (!hasAnalysis) {
    // If there is no CV analysis, redirect to CV Upload page
    return <Navigate replace state={{ from: location }} to="/cv-upload" />;
  }

  return <Outlet />;
}
