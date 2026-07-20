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
    <div className="admin-premium-wallpaper min-h-screen bg-slate-100 text-slate-900">
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsOpen(false)}
      />
      <div
        className={clsx(
          "fixed top-4 bottom-4 left-4 z-50 flex w-[260px] flex-col gap-4 transition-transform duration-300 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
        )}
      >
        {/* Admin Profile Card */}
        <div className="bg-white rounded-[28px] p-4 flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
          <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">Admin</p>
            <p className="text-xs text-slate-500 truncate">Control Panel</p>
          </div>
        </div>

        {/* Navigation Card */}
        <div className="bg-white rounded-[32px] pl-4 py-4 pr-0 flex-1 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 overflow-visible">
          
          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar-sidebar pl-2 pt-2 pb-4 w-[calc(100%+24px)]">
            {adminNavigation.map(({ icon: Icon, label, path }) => {
              const key = path.split("/").pop().replace("-", "");
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-4 py-3 transition-all duration-300",
                      isActive
                        ? "nav-item-active-admin font-bold w-[calc(100%-24px)]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-full w-[calc(100%-40px)] mr-10"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm">{t(`sidebar.${key}`, label)}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1 relative z-0 mx-2 pr-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium w-full"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">{t("settings.session.logout", "Logout")}</span>
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
          
          .nav-item-active-admin {
            position: relative;
            background: #f1f5f9;
            color: #0f172a;
            border-radius: 24px 0 0 24px;
            margin-left: 12px;
            z-index: 10;
          }

          .nav-item-active-admin::before {
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

          .nav-item-active-admin::after {
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

      <div className="min-w-0 lg:pl-[290px]">
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
              <div className="hidden sm:flex flex-col items-end border-l border-slate-200 pl-3">
                <span className="text-xs font-semibold text-slate-800">
                  {currentDateTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {currentDateTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
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
