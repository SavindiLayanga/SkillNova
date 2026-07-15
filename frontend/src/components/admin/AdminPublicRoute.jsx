import { Navigate, Outlet } from "react-router-dom";
import useAdminAuth from "../../hooks/useAdminAuth.js";

export default function AdminPublicRoute() {
  const { isLoggedIn, loading } = useAdminAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Loading admin session...</div>;
  }

  if (isLoggedIn) {
    return <Navigate replace to="/admin/dashboard" />;
  }

  return <Outlet />;
}
