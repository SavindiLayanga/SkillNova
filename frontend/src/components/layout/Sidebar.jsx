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
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-[200px] flex-col bg-white py-8 shadow-sm transition-transform duration-300 ease-out lg:translate-x-0 rounded-r-[32px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center justify-center gap-2 px-6 w-full">
            <span className="text-xl font-bold text-black tracking-tight flex-1">SkillNova</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 space-y-1.5 overflow-y-auto px-0 custom-scrollbar-sidebar relative">
          {navigation.map(({ icon: Icon, label, path }) => (
            <NavLink
              className={({ isActive }) =>
                clsx(
                  "group relative flex items-center gap-3 py-3 px-4 transition-all duration-300 mx-4 rounded-xl font-medium",
                  isActive
                    ? "bg-black text-white shadow-md shadow-black/10"
                    : "text-primary-600 hover:text-black hover:bg-primary-50"
                )
              }
              key={path}
              onClick={onClose}
              to={path}
            >
              {({ isActive }) => (
                <>
                   <Icon
                     className={clsx(
                       "h-5 w-5 shrink-0 transition-colors",
                       isActive ? "text-white" : "text-primary-400 group-hover:text-black"
                     )}
                     strokeWidth={isActive ? 2 : 1.8}
                   />
                  <span className="text-[13px]">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Logout */}
          <button
            className="group relative flex items-center gap-3 py-3 px-4 transition-all duration-300 mx-4 rounded-xl font-medium text-primary-600 hover:text-error hover:bg-error/10 mt-2"
            onClick={handleLogout}
            type="button"
          >
             <LogOut
               className="h-5 w-5 shrink-0 text-primary-400 group-hover:text-error transition-colors"
               strokeWidth={1.8}
             />
            <span className="text-[13px]">Logout</span>
          </button>
        </nav>

        {/* Chatbot trigger */}
        <div className="mt-4 px-4 pb-4">
          <button
            className="w-full h-12 rounded-xl bg-black text-white flex items-center justify-center gap-2 hover:bg-[#222] transition-colors active:scale-95 group shadow-md shadow-black/10"
            onClick={onChatClick}
            type="button"
          >
             <Bot className="h-5 w-5" strokeWidth={1.8} />
             <span className="text-[13px] font-medium">AI Help</span>
          </button>
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
        `}} />
      </aside>
    </>
  );
}
