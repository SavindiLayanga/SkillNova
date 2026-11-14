import {
  Bell,
  Menu,
  Search,
  MessageSquare,
  LayoutDashboard,
  FileText,
  CheckSquare,
  GraduationCap,
  Briefcase,
  ChevronRight,
  UserPlus,
  LogOut,
  ChevronDown,
  Check,
  Trash2,
  X,
  Users
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import useCVAnalysis from "../../hooks/useCVAnalysis.js";

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const SEARCH_INDEX = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard, path: "/", description: "Overview of your progress" },
  { id: "cv-setup", title: "CV & Profile Setup", icon: FileText, path: "/cv-upload", description: "Upload your CV or add skills manually" },
  { id: "skill-tests", title: "Skill Assessments", icon: CheckSquare, path: "/skill-tests", description: "Take quizzes to validate skills" },
  { id: "learning-path", title: "Learning Path", icon: GraduationCap, path: "/learning-path", description: "View your personalized AI roadmap" },
  { id: "job-matches", title: "Job Recommendations", icon: Briefcase, path: "/job-matches", description: "Find jobs matching your verified skills" },
  { id: "ai-chat", title: "Ask AI Assistant", icon: MessageSquare, action: "open_chat", description: "Get career advice from AI" },
];

export default function Navbar({ onMenuClick, onChatClick }) {
  const { user, getToken, savedAccounts, addAccount, switchAccount, removeAccount, logout, logoutAll } = useAuth();
  const navigate = useNavigate();
  const { analysis } = useCVAnalysis();
  const accountName = user?.name && user.name !== "User" && user.name !== "SkillNova User" ? user.name : null;
  const cvName = analysis?.name && !analysis.name.includes("Mock") && analysis.name !== "User" && analysis.name !== "Candidate's full name" 
    ? analysis.name 
    : null;
  let rawName = accountName || cvName || "SkillNova User";
    
  if (rawName.length > 25) {
    const words = rawName.split(" ");
    rawName = words.length > 2 ? words.slice(0, 2).join(" ") : rawName;
    if (rawName.length > 25) {
      rawName = rawName.substring(0, 25) + "...";
    }
  }
  const displayName = rawName;
  const track = analysis?.targetRole && analysis.targetRole !== "Unknown Role" 
    ? analysis.targetRole 
    : user?.targetRole || "Software Developer";
  const initials = getInitials(displayName) || "SN";
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Multi-account switcher states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredResults = SEARCH_INDEX.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const token = await getToken();
        if (!token) return;
        
        const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/user/notifications", {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.isRead).length);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (user) {
      fetchNotifications();
    }
  }, [user, getToken]);

  const handleMarkAllAsRead = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/user/notifications/read-all", {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectResult = (item) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    if (item.action === "open_chat") {
      onChatClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4">
        <button
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search */}
        <div className="hidden min-w-0 flex-1 md:block relative" ref={searchRef}>
          <div className="flex items-center gap-3 rounded-lg border border-ink-100 bg-ink-50/90 px-4 py-2.5 focus-within:border-primary-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary-400 transition-all">
            <Search className="h-4 w-4 text-ink-500" />
            <input
              className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-500"
              placeholder="Search courses, jobs, skills, or pages... (e.g., 'tests')"
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim() !== "" && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-ink-100 bg-white shadow-xl overflow-hidden animate-fade-in-slide-up">
              {filteredResults.length > 0 ? (
                <div className="max-h-[350px] overflow-y-auto py-2">
                  <div className="px-3 pb-2 pt-1 text-xs font-bold text-ink-400 uppercase tracking-wider">Quick Actions</div>
                  {filteredResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-ink-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                            <p className="text-xs text-ink-500">{item.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-ink-300" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-ink-500 text-sm">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-3">
          <button
            aria-label="Chat"
            className="rounded-lg border border-ink-100 bg-white/90 p-2.5 text-ink-500 transition hover:bg-ink-50"
            onClick={onChatClick}
            type="button"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          
          <div className="relative">
            <button
              aria-label="Notifications"
              className="relative rounded-lg border border-ink-100 bg-white/90 p-2.5 text-ink-500 transition hover:bg-ink-50"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              type="button"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white"></span>
              )}
            </button>
            
            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-ink-100 bg-white shadow-2xl overflow-hidden animate-fade-in-slide-up origin-top-right">
                  <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/50 px-4 py-3">
                    <h3 className="font-bold text-ink-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <button 
                          key={notification._id} 
                          onClick={() => {
                            if (notification.link) {
                              setIsNotificationsOpen(false);
                              navigate(notification.link);
                            }
                          }}
                          className={`w-full text-left p-4 border-b border-ink-100 hover:bg-ink-50 transition-colors flex gap-3 ${notification.isRead ? 'opacity-60' : ''}`}
                        >
                          <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-primary-500'}`} />
                          <div>
                            <p className="text-sm font-semibold text-ink-900">{notification.title}</p>
                            <p className="text-xs text-ink-500 mt-0.5 whitespace-pre-wrap">{notification.message}</p>
                            <p className="text-[10px] text-ink-400 mt-2 font-medium">{new Date(notification.createdAt).toLocaleDateString()}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-ink-500">No notifications yet.</div>
                    )}
                  </div>
                  <div className="border-t border-ink-100 p-2 text-center bg-ink-50/50">
                    <button onClick={handleMarkAllAsRead} className="text-xs font-bold text-ink-500 hover:text-ink-900 transition-colors">Mark all as read</button>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Multi-Account Profile & Switcher Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 rounded-full p-1 pl-2 hover:bg-ink-50 transition-colors focus:outline-none"
              title="Account & Multi-User Switcher"
              type="button"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-ink-900 leading-tight">
                  {displayName}
                </p>
                <p className="text-xs text-ink-500">{track}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 ring-2 ring-primary-500/20">
                {initials}
              </div>
              <ChevronDown className="h-4 w-4 text-ink-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-ink-100 bg-white shadow-2xl overflow-hidden animate-fade-in-slide-up origin-top-right">
                {/* Active Account Header */}
                <div className="p-4 bg-gradient-to-br from-primary-50/50 via-white to-ink-50/30 border-b border-ink-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white font-extrabold text-lg shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-ink-900 truncate">{displayName}</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                          <Check className="h-3 w-3" /> Active
                        </span>
                      </div>
                      <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                      <p className="text-[11px] text-primary-600 font-medium truncate mt-0.5">{track}</p>
                    </div>
                  </div>
                </div>

                {/* Other Saved Accounts */}
                {savedAccounts && savedAccounts.filter(a => a.email.toLowerCase() !== user?.email?.toLowerCase()).length > 0 && (
                  <div className="p-2 border-b border-ink-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 px-3 py-1">
                      Other Accounts ({savedAccounts.filter(a => a.email.toLowerCase() !== user?.email?.toLowerCase()).length})
                    </p>
                    <div className="space-y-1">
                      {savedAccounts
                        .filter(a => a.email.toLowerCase() !== user?.email?.toLowerCase())
                        .map(acc => {
                          const accInitials = getInitials(acc.name || acc.email) || "U";
                          return (
                            <div
                              key={acc.email}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-ink-50 transition-colors group"
                            >
                              <button
                                onClick={async () => {
                                  try {
                                    setIsProfileOpen(false);
                                    await switchAccount(acc.email);
                                  } catch (err) {
                                    if (err.message === "PASSWORD_REQUIRED") {
                                      setAddEmail(acc.email);
                                      setIsAddModalOpen(true);
                                    } else {
                                      alert(err.message || "Failed to switch account");
                                    }
                                  }
                                }}
                                className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                                type="button"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                                  {accInitials}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-ink-900 truncate">{acc.name || acc.email.split('@')[0]}</p>
                                  <p className="text-[11px] text-ink-500 truncate">{acc.email}</p>
                                </div>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAccount(acc.email);
                                }}
                                className="p-1.5 text-ink-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Remove from switcher"
                                type="button"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Account Actions */}
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setAddEmail("");
                      setAddPassword("");
                      setAddError("");
                      setIsAddModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                    type="button"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>+ Add Another Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      navigate("/login", { replace: true });
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-ink-600 hover:bg-ink-50 rounded-xl transition-colors"
                    type="button"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out of this account</span>
                  </button>

                  {savedAccounts && savedAccounts.length > 1 && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logoutAll();
                        navigate("/login", { replace: true });
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Sign out of all accounts</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Another Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-ink-100 bg-ink-50/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink-900">Add Another Account</h3>
                  <p className="text-xs text-ink-500">Sign in to keep multiple users active simultaneously</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-ink-400 hover:text-ink-700 hover:bg-ink-100"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAddError("");
                setAddLoading(true);
                try {
                  await addAccount(addEmail, addPassword);
                  setIsAddModalOpen(false);
                  setAddEmail("");
                  setAddPassword("");
                } catch (err) {
                  setAddError(err.message || "Failed to sign in to account");
                } finally {
                  setAddLoading(false);
                }
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>

              {addError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                  {addError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-ink-200 px-4 py-2.5 text-xs font-bold text-ink-600 hover:bg-ink-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {addLoading ? "Signing in..." : "Sign in & Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
