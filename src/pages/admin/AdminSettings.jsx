import { LogOut, ShieldAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import useAdminAuth from "../../hooks/useAdminAuth.js";

export default function AdminSettings() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div>
      <AdminPageHeader
        description="Manage admin security preferences and session access."
        title="Admin Settings"
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Security notice
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Admin access is separate from student accounts. Use a strong
                password and sign out when you finish platform management tasks.
              </p>
              <Button as={Link} className="mt-5" to="/admin/change-password">
                Change Password
              </Button>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="text-lg font-bold text-slate-950">Session</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            End the current admin session and return to the separate admin login
            page.
          </p>
          <Button
            className="mt-5"
            icon={LogOut}
            onClick={handleLogout}
            variant="secondary"
          >
            Logout
          </Button>
        </AdminCard>
      </section>
    </div>
  );
}
