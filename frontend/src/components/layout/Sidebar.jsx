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
          "fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-[110px] flex-col border-r-0 bg-primary-600 py-8 shadow-[20px_0_50px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out lg:translate-x-0 rounded-r-[35px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white text-primary-500 shadow-md">
            <Sparkles className="h-8 w-8" strokeWidth={2} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 space-y-1.5 overflow-y-auto px-0 custom-scrollbar-sidebar">
          {navigation.map(({ icon: Icon, label, path }) => (
            <NavLink
              className={({ isActive }) =>
                clsx(
                  "group relative flex flex-col items-center justify-center gap-1.5 py-3 transition-all duration-300 mx-auto",
                  isActive
                    ? "bg-white text-primary-600 rounded-[24px] shadow-[0_10px_25px_rgba(0,0,0,0.15)] w-[125px] -ml-3 z-10"
                    : "text-primary-100 hover:text-white hover:bg-white/10 rounded-[20px] w-[86px]"
                )
              }
              key={path}
              onClick={onClose}
              to={path}
            >
              {({ isActive }) => (
                <>
                  <div className={clsx("flex items-center justify-center h-10 w-10 rounded-full transition-colors", isActive ? "bg-primary-50" : "")}>
                     <Icon
                       className={clsx(
                         "h-[24px] w-[24px] shrink-0",
                         isActive
                           ? "text-primary-600"
                           : "text-primary-200 group-hover:text-white"
                       )}
                       strokeWidth={isActive ? 2.2 : 1.8}
                     />
                  </div>
                  <span className="text-[11px] font-semibold text-center leading-tight px-1">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* Logout */}
          <button
            className="group relative flex flex-col items-center justify-center gap-1.5 py-3 transition-all duration-300 mx-auto w-[86px] text-primary-100 hover:text-white hover:bg-white/10 rounded-[20px] mt-2"
            onClick={handleLogout}
            type="button"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-full">
               <LogOut
                 className="h-[24px] w-[24px] shrink-0 text-primary-200 group-hover:text-white"
                 strokeWidth={1.8}
               />
            </div>
            <span className="text-[11px] font-semibold text-center leading-tight px-1">Logout</span>
          </button>
        </nav>

        {/* Chatbot trigger */}
        <div className="mt-4 px-3">
          <button
            className="w-full h-16 rounded-[24px] bg-primary-700/50 shadow-inner border border-primary-500/30 backdrop-blur-sm flex flex-col items-center justify-center gap-1 hover:bg-primary-500 transition-colors active:scale-95 group"
            onClick={onChatClick}
            type="button"
          >
             <Bot className="h-6 w-6 text-white group-hover:text-primary-100" strokeWidth={1.8} />
             <span className="text-[10px] font-bold text-white uppercase tracking-wider">Help</span>
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
