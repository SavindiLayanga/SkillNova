import { Bell, Menu, Search, MessageSquare, LayoutDashboard, FileText, CheckSquare, GraduationCap, Briefcase, ChevronRight } from "lucide-react";
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
  { id: "ai-chat", title: "Ask AI Assistant", icon: MessageSquare, action: "open_chat", description: "Get career advice from Gemini" },
];

export default function Navbar({ onMenuClick, onChatClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { analysis } = useCVAnalysis();
  const displayName = analysis?.name && !analysis.name.includes("Mock") && analysis.name !== "User" && analysis.name !== "Candidate's full name" 
    ? analysis.name 
    : user?.name || "SkillNova User";
  const track = analysis?.targetRole && analysis.targetRole !== "Unknown Role" 
    ? analysis.targetRole 
    : user?.targetRole || "Unknown Role";
  const initials = getInitials(displayName) || "SN";
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredResults = SEARCH_INDEX.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white"></span>
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
                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <button className="w-full text-left p-4 border-b border-ink-100 hover:bg-ink-50 transition-colors flex gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                      <div>
                        <p className="text-sm font-semibold text-ink-900">New job match found!</p>
                        <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">Sysco LABS is hiring for your target role. Your skill match is 89%.</p>
                        <p className="text-[10px] text-ink-400 mt-2 font-medium">Just now</p>
                      </div>
                    </button>
                    <button className="w-full text-left p-4 border-b border-ink-100 hover:bg-ink-50 transition-colors flex gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                      <div>
                        <p className="text-sm font-semibold text-ink-900">Skill Test Recommended</p>
                        <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">Complete the React Fundamentals assessment to unlock the 'React Expert' badge.</p>
                        <p className="text-[10px] text-ink-400 mt-2 font-medium">2 hours ago</p>
                      </div>
                    </button>
                    <button className="w-full text-left p-4 hover:bg-ink-50 transition-colors flex gap-3 opacity-60">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-transparent" />
                      <div>
                        <p className="text-sm font-semibold text-ink-900">Profile Analyzed</p>
                        <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">Your CV has been successfully parsed and your learning path is ready.</p>
                        <p className="text-[10px] text-ink-400 mt-2 font-medium">Yesterday</p>
                      </div>
                    </button>
                  </div>
                  <div className="border-t border-ink-100 p-2 text-center bg-ink-50/50">
                    <button className="text-xs font-bold text-ink-500 hover:text-ink-900 transition-colors">Mark all as read</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
               <p className="text-sm font-semibold text-ink-900">
                {displayName}
              </p>
              <p className="text-xs text-ink-500">{track}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
