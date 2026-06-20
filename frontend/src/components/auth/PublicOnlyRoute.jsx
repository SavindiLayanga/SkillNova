import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

export default function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return <Outlet />;
}
