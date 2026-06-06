import {
  Bot,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileText,
  House,
  LogOut,
  Map,
  Settings,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import clsx from "../../utils/clsx.js";

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: House },
  { label: "CV Upload", path: "/cv-upload", icon: FileText },
  { label: "Skill Gap Analysis", path: "/skill-gap", icon: Target },
  { label: "Job Recommendations", path: "/job-matches", icon: BriefcaseBusiness },
  { label: "Learning Path", path: "/learning-path", icon: Map },
  { label: "Skill Tests", path: "/skill-tests", icon: ClipboardCheck },
  { label: "Progress Tracking", path: "/progress", icon: ChartNoAxesCombined },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose, onChatClick }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    onClose();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-ink-900/30 transition lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-ink-100 bg-white/95 px-5 py-6 shadow-[18px_0_45px_rgba(23,32,51,0.06)] backdrop-blur transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-1">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500">
            <Sparkles className="h-9 w-9" strokeWidth={1.8} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold leading-7 text-primary-500">
              SkillNova
            </p>
            <p className="text-sm font-medium text-ink-500">
              AI Career Platform
            </p>
          </div>
        </div>

        <nav className="mt-9 flex-1 space-y-2 overflow-y-auto pr-1">
          {navigation.map(({ icon: Icon, label, path }) => (
            <NavLink
              className={({ isActive }) =>
                clsx(
                  "group relative flex min-h-12 items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-semibold transition",
                  isActive
                    ? "bg-primary-50 text-primary-600 shadow-sm shadow-primary-100"
                    : "text-ink-900 hover:bg-ink-50"
                )
              }
              key={path}
              onClick={onClose}
              to={path}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span className="absolute left-0 top-2 h-8 w-1 rounded-r-full bg-primary-500" />
                  ) : null}
                  <Icon
                    className={clsx(
                      "h-5 w-5 shrink-0",
                      isActive
                        ? "text-primary-500"
                        : "text-ink-500 group-hover:text-primary-500"
                    )}
                    strokeWidth={1.9}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <button
            className="group flex min-h-12 w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] font-semibold text-ink-900 transition hover:bg-ink-50"
            onClick={handleLogout}
            type="button"
          >
            <LogOut
              className="h-5 w-5 shrink-0 text-ink-500 group-hover:text-primary-500"
              strokeWidth={1.9}
            />
            Logout
          </button>
        </nav>

        <div className="mt-6 rounded-xl border border-ink-100 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-500">
              <Bot className="h-12 w-12" strokeWidth={1.6} />
            </div>
            <div>
              <p className="text-base font-bold text-ink-900">Need Help?</p>
              <p className="mt-2 text-sm leading-5 text-ink-500">
                Chat with our AI assistant anytime.
              </p>
            </div>
          </div>
          <button
            className="mt-4 h-10 w-full rounded-lg bg-primary-500 text-sm font-bold text-white shadow-sm shadow-primary-500/25 transition hover:bg-primary-600"
            type="button"
            onClick={onChatClick}
          >
            Chat Now
          </button>
        </div>
      </aside>
    </>
  );
}
