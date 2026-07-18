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
  AlertCircle
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

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          {adminNavigation.map(({ icon: Icon, label, path }) => {
            const key = path.split("/").pop().replace("-", "");
            return (
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
                {t(`sidebar.${key}`, label)}
              </NavLink>
            );
          })}
        </nav>

        <button
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="h-5 w-5" />
          {t("settings.session.logout", "Logout")}
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
            <div className="ml-auto flex items-center gap-3">
              <div className="relative" ref={notificationRef}>
                <button
                  aria-label="Notifications"
                  className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 pb-2">
                      <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
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
                        <div className="px-4 py-6 text-center text-sm text-slate-500">
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
                                "flex gap-3 px-4 py-3 transition hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0",
                                !notification.isRead && "bg-slate-50/50"
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
                                  <p className={clsx("text-sm truncate", !notification.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700")}>
                                    {notification.title}
                                  </p>
                                  {!notification.isRead && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500"></span>
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="mt-1.5 text-[10px] font-semibold text-slate-400" title={formatDateTime(notification.createdAt, preferences)}>
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
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-7 pb-12 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
