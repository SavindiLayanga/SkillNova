import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAdminAuth from "../../hooks/useAdminAuth.js";

export default function AdminProtectedRoute({ allowDefaultPassword = false }) {
  const { isDefaultPassword, isLoggedIn } = useAdminAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate replace state={{ from: location }} to="/admin/login" />;
  }

  if (isDefaultPassword && !allowDefaultPassword) {
    return <Navigate replace to="/admin/change-password" />;
  }

  return <Outlet />;
}
