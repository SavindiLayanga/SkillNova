import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  Gauge,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Search,
  MessageSquare
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAdminAuth from "../../hooks/useAdminAuth.js";
import clsx from "../../utils/clsx.js";
import adminNotificationService from "../../services/adminNotificationService.js";
import { usePreferences } from "../../context/PreferencesContext.jsx";
import { formatRelativeTime, formatDateTime } from "../../utils/dateUtils.js";
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { preferences } = usePreferences();
  const { adminUser } = useAdminAuth();
  
  const displayName = adminUser?.name || adminUser?.username || "Admin User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "AD";
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(timer);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await adminNotificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await adminNotificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminNotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="premium-wallpaper min-h-screen bg-ink-50 text-ink-900">
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-[200px] flex-col bg-white py-8 shadow-sm transition-transform duration-300 ease-out lg:translate-x-0 rounded-r-[32px]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-6 relative">
          <div className="flex items-center justify-center gap-2 px-6 w-full">
            <span className="text-xl font-bold text-black tracking-tight flex-1">SkillNova</span>
          </div>
          <button
            aria-label="Close admin menu"
            className="absolute -right-3 top-0 rounded-lg p-1 text-ink-400 hover:text-ink-900 lg:hidden"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-2 flex-1 space-y-1.5 overflow-y-auto px-0 custom-scrollbar-sidebar">
          {adminNavigation.map(({ icon: Icon, label, path }) => {
            const key = path.split("/").pop().replace("-", "");
            return (
              <NavLink
                className={({ isActive }) =>
                  clsx(
                    "group relative flex flex-col gap-1.5 py-3 transition-all duration-300 mx-auto",
                    isActive
                      ? "items-start pl-6 mx-auto bg-black text-white rounded-[28px] shadow-md w-[116px] z-10"
                      : "items-center justify-center text-ink-500 hover:text-ink-900 hover:bg-ink-50 rounded-[24px] w-[120px]"
                  )
                }
                key={path}
                onClick={() => setIsOpen(false)}
                to={path}
              >
                {({ isActive }) => (
                  <>
                    <div className={clsx("flex items-center justify-center h-10 w-10 rounded-full transition-colors", isActive ? "bg-white/10" : "")}>
                       <Icon
                         className={clsx(
                           "h-[24px] w-[24px] shrink-0",
                           isActive
                             ? "text-white"
                             : "text-ink-400 group-hover:text-ink-900"
                         )}
                         strokeWidth={isActive ? 2.2 : 1.8}
                       />
                    </div>
                    <span className={clsx("text-[11px] font-semibold leading-tight px-1", isActive ? "text-left" : "text-center")}>
                      {t(`sidebar.${key}`, label)}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Logout */}
        <div className="mt-auto px-0 pb-6 pt-2">
          <button
            className="group relative flex flex-col items-center justify-center gap-1.5 py-3 transition-all duration-300 mx-auto w-[120px] text-error hover:text-error hover:bg-error/10 rounded-[24px]"
            onClick={handleLogout}
            type="button"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-full">
               <LogOut
                 className="h-[24px] w-[24px] shrink-0 text-error/80 group-hover:text-error"
                 strokeWidth={1.8}
               />
            </div>
            <span className="text-[11px] font-semibold text-center leading-tight px-1">{t("settings.session.logout", "Logout")}</span>
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

      <div className="min-w-0 lg:pl-[200px]">
        <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1600px] items-center gap-4">
            <button
              aria-label="Open admin menu"
              className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 lg:hidden"
              onClick={() => setIsOpen(true)}
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Global Search */}
            <div className="hidden min-w-0 flex-1 md:block relative">
              <div className="flex items-center gap-3 rounded-lg border border-ink-100 bg-ink-50/90 px-4 py-2.5 focus-within:border-primary-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary-400 transition-all">
                <Search className="h-4 w-4 text-ink-500" />
                <input
                  className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-500"
                  placeholder="Search users, jobs, courses..."
                  type="search"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                aria-label="Chat"
                className="rounded-lg border border-ink-100 bg-white/90 p-2.5 text-ink-500 transition hover:bg-ink-50 hidden sm:block"
                type="button"
              >
                <MessageSquare className="h-5 w-5" />
              </button>
              
              <div className="relative" ref={notificationRef}>
                <button
                  aria-label="Notifications"
                  className="relative rounded-lg border border-ink-100 bg-white/90 p-2.5 text-ink-500 transition hover:bg-ink-50"
                  onClick={() => setShowNotifications(!showNotifications)}
                  type="button"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5 focus:outline-none">
                    <div className="flex items-center justify-between border-b border-ink-100 px-4 pb-2">
                      <h3 className="text-sm font-semibold text-ink-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[28rem] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-ink-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          let Icon = Info;
                          let iconColor = "text-blue-500";
                          let bgColor = "bg-blue-50";

                          if (notification.type === "success") {
                            Icon = CheckCircle;
                            iconColor = "text-emerald-500";
                            bgColor = "bg-emerald-50";
                          } else if (notification.type === "warning") {
                            Icon = AlertTriangle;
                            iconColor = "text-amber-500";
                            bgColor = "bg-amber-50";
                          } else if (notification.type === "error") {
                            Icon = AlertCircle;
                            iconColor = "text-red-500";
                            bgColor = "bg-red-50";
                          }

                          return (
                            <div 
                              key={notification._id} 
                              className={clsx(
                                "flex gap-3 px-4 py-3 transition hover:bg-ink-50 cursor-pointer border-b border-ink-50 last:border-0",
                                !notification.isRead && "bg-ink-50/50"
                              )}
                              onClick={() => {
                                if (!notification.isRead) handleMarkAsRead(notification._id);
                                if (notification.link) navigate(notification.link);
                              }}
                            >
                              <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", bgColor)}>
                                <Icon className={clsx("h-4 w-4", iconColor)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={clsx("text-sm truncate", !notification.isRead ? "font-semibold text-ink-900" : "font-medium text-ink-700")}>
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500"></span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-ink-500 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="mt-1.5 text-[10px] font-semibold text-ink-400" title={formatDateTime(notification.createdAt, preferences)}>
                                  {formatRelativeTime(notification.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 pl-2 border-l border-ink-100 ml-1">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-ink-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-ink-500 capitalize">{adminUser?.role?.replace('_', ' ') || "Administrator"}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 shadow-sm border border-primary-200">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] px-4 py-7 pb-12 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
