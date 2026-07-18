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
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-950">
                Security notice
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Admin access is separate from student accounts. Use a strong
                password and sign out when you finish platform management tasks.
              </p>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <label className="flex cursor-pointer gap-4 rounded-lg border border-slate-100 bg-white p-4 transition-colors hover:border-slate-200">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-950">Two-factor authentication (2FA)</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Add an extra layer of security to your admin account by requiring more than just a password to sign in.
                    </p>
                  </div>
                  <div className="pt-1">
                    <input
                      className="h-5 w-5 cursor-pointer rounded border-slate-200 text-amber-600 focus:ring-amber-500"
                      type="checkbox"
                    />
                  </div>
                </label>
              </div>

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
