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
  History,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import clsx from "../../utils/clsx.js";

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: House },
  { label: "CV Upload", path: "/cv-upload", icon: FileText },
  { label: "History", path: "/cv-history", icon: History },
  { label: "Skill Gaps", path: "/skill-gap", icon: Target },
  { label: "Jobs", path: "/job-matches", icon: BriefcaseBusiness },
  { label: "Learning", path: "/learning-path", icon: Map },
  { label: "Tests", path: "/skill-tests", icon: ClipboardCheck },
  { label: "Progress", path: "/progress", icon: ChartNoAxesCombined },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose, onChatClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    onClose();
    navigate("/login", { replace: true });
  }

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          "fixed top-4 bottom-4 left-4 z-50 flex w-[260px] flex-col gap-4 transition-transform duration-300 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
        )}
      >
        {/* Profile Card */}
        <div className="bg-white rounded-[28px] p-4 flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
          </div>
        </div>

        {/* Navigation Card */}
        <div className="bg-white rounded-[32px] pl-4 py-4 pr-0 flex-1 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-visible">
          
          <div className="flex items-center gap-2 px-2 mb-6 mt-2 pr-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-primary-600 text-white shadow-md">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </div>
            <span className="font-black text-lg text-slate-800 tracking-tight">SkillNova</span>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar-sidebar pl-2 pt-2 pb-4 w-[calc(100%+24px)]">
            {navigation.map(({ icon: Icon, label, path }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-4 py-3 transition-all duration-300",
                    isActive
                      ? "nav-item-active-user font-bold w-[calc(100%-24px)]"
                      : "text-slate-500 hover:bg-primary-50 hover:text-primary-600 font-medium rounded-full w-[calc(100%-40px)] mr-10"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1 relative z-0 mx-2 pr-4">
            <button
              onClick={onChatClick}
              className="flex items-center gap-3 px-4 py-3 rounded-full text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium w-full"
            >
              <Bot className="h-5 w-5" />
              <span className="text-sm">AI Assistant</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar-sidebar::-webkit-scrollbar {
            width: 0px;
            display: none;
          }
          .custom-scrollbar-sidebar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .nav-item-active-user {
            position: relative;
            background: #f1f5f9;
            color: #d65555;
            border-radius: 24px 0 0 24px;
            margin-left: 12px;
            z-index: 10;
          }

          .nav-item-active-user::before {
            content: "";
            position: absolute;
            top: -48px;
            right: 0;
            width: 48px;
            height: 48px;
            background: transparent;
            border-radius: 50%;
            box-shadow: 24px 24px 0 0 #f1f5f9;
            pointer-events: none;
          }

          .nav-item-active-user::after {
            content: "";
            position: absolute;
            bottom: -48px;
            right: 0;
            width: 48px;
            height: 48px;
            background: transparent;
            border-radius: 50%;
            box-shadow: 24px -24px 0 0 #f1f5f9;
            pointer-events: none;
          }
        `}} />
      </div>
    </>
  );
}
