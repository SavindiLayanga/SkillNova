import { Navigate, Outlet } from "react-router-dom";
import useAdminAuth from "../../hooks/useAdminAuth.js";

export default function AdminPublicRoute() {
  const { isDefaultPassword, isLoggedIn } = useAdminAuth();

  if (isLoggedIn) {
    return (
      <Navigate
        replace
        to={isDefaultPassword ? "/admin/change-password" : "/admin/dashboard"}
      />
    );
  }

  return <Outlet />;
}
