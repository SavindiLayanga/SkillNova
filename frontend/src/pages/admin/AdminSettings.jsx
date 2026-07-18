import { LogOut, ShieldAlert, Edit3, User, Mail, Phone, Shield, Clock, Camera } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import useAdminAuth from "../../hooks/useAdminAuth.js";

export default function AdminSettings() {
  const { logout, adminUser } = useAdminAuth();
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

      {/* Admin Profile Section */}
      <section className="mb-6">
        <AdminCard>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                  {adminUser?.profileImage ? (
                    <img src={adminUser.profileImage} alt="Admin" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-primary-700 transition">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{adminUser?.name || adminUser?.username || "Admin User"}</h2>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {adminUser?.email || "No email provided"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {adminUser?.phone || "+94 77 123 4567"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <span className="capitalize">{adminUser?.role?.replace('_', ' ') || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Last Login: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <Button icon={Edit3} variant="outline" className="shrink-0">
              Edit Profile
            </Button>
          </div>
        </AdminCard>
      </section>

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
