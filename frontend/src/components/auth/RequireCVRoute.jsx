import { Navigate, Outlet, useLocation } from "react-router-dom";
import useCVAnalysis from "../../hooks/useCVAnalysis.js";
import Loader from "../ui/Loader.jsx";

export default function RequireCVRoute() {
  const { hasAnalysis, status } = useCVAnalysis();
  const location = useLocation();

  if (status === "initializing") {
    return <div className="flex h-screen items-center justify-center"><Loader text="Loading your analysis..." /></div>;
  }

  if (!hasAnalysis) {
    // If there is no CV analysis, redirect to CV Upload page
    return <Navigate replace state={{ from: location }} to="/cv-upload" />;
  }

  return <Outlet />;
}
