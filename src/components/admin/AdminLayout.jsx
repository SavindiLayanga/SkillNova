import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  Gauge,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAdminAuth from "../../hooks/useAdminAuth.js";
import clsx from "../../utils/clsx.js";

const adminNavigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: Gauge },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "CV Reviews", path: "/admin/cv-reviews", icon: ClipboardCheck },
  { label: "Jobs", path: "/admin/jobs", icon: BriefcaseBusiness },
  { label: "Courses", path: "/admin/courses", icon: BookOpen },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-premium-wallpaper min-h-screen bg-slate-100 text-slate-900">
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-slate-950/40 transition lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 px-4 py-5 text-white transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500 text-xl font-black">
              S
            </div>
            <div>
              <p className="text-lg font-bold">SkillNova Admin</p>
              <p className="text-xs text-slate-400">Operations console</p>
            </div>
          </div>
          <button
            aria-label="Close admin menu"
            className="rounded-lg p-2 text-slate-300 lg:hidden"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {adminNavigation.map(({ icon: Icon, label, path }) => (
            <NavLink
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                )
              }
              key={path}
              onClick={() => setIsOpen(false)}
              to={path}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      <div className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
            <button
              aria-label="Open admin menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setIsOpen(true)}
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-600">
                Admin Panel
              </p>
              <p className="text-lg font-bold text-slate-950">
                SkillNova Management
              </p>
            </div>
            <button
              className="ml-auto rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-7 pb-12 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
