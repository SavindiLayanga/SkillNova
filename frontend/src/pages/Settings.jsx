import { Bell, BriefcaseBusiness, Lock, Mail, Save, ShieldCheck, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import FormField from "../components/ui/FormField.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Loader from "../components/ui/Loader.jsx";
import useAuth from "../hooks/useAuth.js";

const preferenceGroups = [
  {
    title: "Recommendation preferences",
    description: "Control how SkillNova prioritizes course and job suggestions.",
    icon: BriefcaseBusiness,
    items: [
      { label: "Email course recommendations", key: "emailCourseRecommendations" },
      { label: "Show remote jobs first", key: "showRemoteJobsFirst" },
      { label: "Use CV data for match scoring", key: "useCVDataForMatchScoring" },
      { label: "Prioritize beginner-friendly learning paths", key: "prioritizeBeginnerFriendlyPaths" },
    ],
  },
  {
    title: "Notification preferences",
    description: "Choose the reminders that help you keep steady progress.",
    icon: Bell,
    items: [
      { label: "Weekly progress reminders", key: "weeklyProgressReminders" },
      { label: "New job match alerts", key: "newJobMatchAlerts" },
      { label: "Skill test availability alerts", key: "skillTestAvailabilityAlerts" },
      { label: "Course completion reminders", key: "courseCompletionReminders" },
    ],
  },
];

const privacyItems = [
  {
    title: "CV analysis storage",
    description: "Keep the latest simulated CV analysis available after refresh.",
    key: "cvAnalysisStorage"
  },
  {
    title: "Personalized recommendations",
    description: "Use target role, skills, and progress to improve suggestions.",
    key: "personalizedRecommendations"
  },
  {
    title: "Progress visibility",
    description: "Show learning progress throughout dashboard and profile pages.",
    key: "progressVisibility"
  },
  {
    title: "Account activity",
    description: "Display recent activity to help track your career workflow.",
    key: "accountActivity"
  },
];

export default function Settings() {
  const { user, getToken } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" }); // type: "success" | "error"
  const [securityReview, setSecurityReview] = useState(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = await getToken();
        if (!token) throw new Error("No token found");
        
        const res = await fetch("http://localhost:5000/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user, getToken]);

  const handleSecurityReview = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token found");
      
      const res = await fetch("http://localhost:5000/api/user/security-review", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load security details");
      
      const data = await res.json();
      setSecurityReview(data);
      setShowSecurityModal(true);
    } catch (error) {
      console.error("Security review error:", error);
      showToast("Could not load security review.", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 1500);
  };

  const handleToggle = async (key, currentValue) => {
    const newValue = !currentValue;
    
    // Optimistic UI update
    setSettings((prev) => ({ ...prev, [key]: newValue }));

    try {
      const token = await getToken();
      if (!token) throw new Error("No token found");

      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ [key]: newValue })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Failed to update");
      }
      let successMessage = "Settings updated successfully.";
      if (newValue) {
        switch(key) {
          case "emailCourseRecommendations": successMessage = "You will now receive course recommendations via email."; break;
          case "showRemoteJobsFirst": successMessage = "Remote jobs will now be prioritized in your matches."; break;
          case "useCVDataForMatchScoring": successMessage = "Your CV data will now be used to provide accurate match scores."; break;
          case "prioritizeBeginnerFriendlyPaths": successMessage = "Beginner-friendly courses will now be prioritized."; break;
          case "weeklyProgressReminders": successMessage = "You will receive a weekly email summarizing your completed tests and average scores."; break;
          case "newJobMatchAlerts": successMessage = "You will receive a daily email with the latest jobs matching your profile."; break;
          case "skillTestAvailabilityAlerts": successMessage = "You will be alerted when new skill tests are added to your library."; break;
          case "courseCompletionReminders": successMessage = "You will receive weekly reminders to complete your active learning paths."; break;
          case "cvAnalysisStorage": successMessage = "CV analysis storage is enabled."; break;
          case "personalizedRecommendations": successMessage = "Personalized recommendations are enabled."; break;
          case "progressVisibility": successMessage = "Progress visibility is enabled."; break;
          case "accountActivity": successMessage = "Account activity tracking is enabled."; break;
          case "twoFactorAuth": successMessage = "Two-factor authentication is enabled."; break;
        }
      } else {
        switch(key) {
          case "emailCourseRecommendations": successMessage = "Email course recommendations disabled."; break;
          case "showRemoteJobsFirst": successMessage = "Remote job prioritization disabled."; break;
          case "useCVDataForMatchScoring": successMessage = "CV data match scoring disabled."; break;
          case "prioritizeBeginnerFriendlyPaths": successMessage = "Beginner-friendly prioritization disabled."; break;
          default: successMessage = "Setting disabled successfully."; break;
        }
      }
      showToast(successMessage, newValue ? "success" : "info");
    } catch (error) {
      console.error("Failed to update setting", error);
      // Revert on failure
      setSettings((prev) => ({ ...prev, [key]: currentValue }));
      showToast(error.message || "Could not update settings", "error");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const token = await getToken();
      if (!token) throw new Error("No token found");

      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: data.name,
          targetRole: data.targetRole,
          location: data.location,
          experience: data.experience,
        })
      });
      if (!res.ok) throw new Error("Failed to save profile");
      showToast("Profile saved successfully", "success");
    } catch (error) {
      console.error("Profile save error:", error);
      showToast("Could not save profile", "error");
    }
  };

  if (loading) {
    return <Loader text="Loading settings..." secondaryText="Please wait." />;
  }

  return (
    <div className="space-y-8 relative">
      <PageHeader
        action={<Button type="submit" form="profile-form" icon={Save}>Save changes</Button>}
        description="Manage profile, recommendations, notifications, and account preferences in one clean flow."
        eyebrow="Settings"
        title="Personalize your career profile"
      />

      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-900">Profile details</h2>
            <p className="text-sm leading-6 text-ink-500">
              Keep the information used for your recommendations up to date.
            </p>
          </div>
        </div>

        <form id="profile-form" onSubmit={handleSaveProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" name="name" defaultValue={user?.name ?? ""} />
          <FormField label="Email" name="email" defaultValue={user?.email ?? ""} type="email" disabled />
          <FormField
            label="Target role"
            name="targetRole"
            defaultValue={user?.targetRole ?? "Junior React Developer"}
          />
          <FormField label="Location" name="location" defaultValue={user?.location ?? "Colombo, Sri Lanka"} />
          <FormField
            className="sm:col-span-2"
            label="Career summary"
            name="experience"
            defaultValue={
              user?.experience ??
              "Final year software engineering student focused on frontend development, UI systems, and practical project work."
            }
            rows="5"
            textarea
          />
        </form>
      </Card>

      <section className="settings-lower-wallpaper -mx-4 px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="space-y-8">
          {preferenceGroups.map(({ description, icon: Icon, items, title }) => (
            <Card key={title}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink-900">{title}</h2>
                  <p className="text-sm leading-6 text-ink-500">{description}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <label
                    className="flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-lg bg-ink-50 p-4 transition-colors hover:bg-ink-100/50"
                    key={item.key}
                  >
                    <span className="text-sm font-semibold text-ink-700">
                      {item.label}
                    </span>
                    <input
                      className="h-5 w-5 cursor-pointer rounded border-ink-200 text-primary-500 focus:ring-primary-400"
                      checked={settings?.[item.key] ?? false}
                      onChange={() => handleToggle(item.key, settings?.[item.key])}
                      type="checkbox"
                    />
                  </label>
                ))}
              </div>
            </Card>
          ))}

          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink-900">
                  Privacy and analysis
                </h2>
                <p className="text-sm leading-6 text-ink-500">
                  Choose how SkillNova uses your uploaded CV and learning data.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {privacyItems.map((item) => (
                <label className="flex cursor-pointer gap-4 rounded-lg border border-ink-100 bg-white p-4 transition-colors hover:border-ink-200" key={item.key}>
                  <div className="flex-1">
                    <h3 className="font-bold text-ink-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-500">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-1">
                    <input
                      className="h-5 w-5 cursor-pointer rounded border-ink-200 text-primary-500 focus:ring-primary-400"
                      checked={settings?.[item.key] ?? false}
                      onChange={() => handleToggle(item.key, settings?.[item.key])}
                      type="checkbox"
                    />
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink-900">
                      Account security
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">
                      Manage your password, two-factor authentication, and other security preferences.
                    </p>
                  </div>
                </div>
                <Button variant="secondary" onClick={handleSecurityReview}>Review security</Button>
              </div>

              <div className="border-t border-ink-100 pt-6">
                <label className="flex cursor-pointer gap-4 rounded-lg border border-ink-100 bg-white p-4 transition-colors hover:border-ink-200">
                  <div className="flex-1">
                    <h3 className="font-bold text-ink-900">Two-factor authentication (2FA)</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-500">
                      Add an extra layer of security to your account by requiring more than just a password to sign in.
                    </p>
                  </div>
                  <div className="pt-1">
                    <input
                      className="h-5 w-5 cursor-pointer rounded border-ink-200 text-primary-500 focus:ring-primary-400"
                      checked={settings?.twoFactorAuth ?? false}
                      onChange={() => handleToggle("twoFactorAuth", settings?.twoFactorAuth)}
                      type="checkbox"
                    />
                  </div>
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink-900">
                    Communication settings
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">
                    Choose how SkillNova contacts you about course updates, CV
                    review changes, and job recommendation improvements.
                  </p>
                </div>
              </div>
              <Button variant="secondary">Manage email</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Toast Notification Modal */}
      {toast.message && createPortal(
        <>
          {/* Backdrop */}
          <div className={`fixed inset-0 z-[100] bg-slate-900/20 animate-in fade-in duration-300 ${toast.type === "error" ? "backdrop-blur-sm" : ""}`} />
          
          {/* Modal Container */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-11/12 max-w-sm rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
            
            {/* Colored Header Area */}
            <div className={`flex justify-center py-8 ${
              toast.type === "error" ? "bg-rose-500" : 
              toast.type === "info" ? "bg-amber-500" : 
              "bg-emerald-500"
            }`}>
              {toast.type === "error" ? (
                <AlertCircle className="h-20 w-20 text-white/90" />
              ) : toast.type === "info" ? (
                <ShieldCheck className="h-20 w-20 text-white/90" />
              ) : (
                <CheckCircle2 className="h-20 w-20 text-white/90" />
              )}
            </div>

            {/* Content Area */}
            <div className="px-6 py-6 text-center">
              <h3 className="mb-2 text-xl font-bold text-slate-800">
                {toast.type === "error" ? "Error" : 
                 toast.type === "info" ? "Setting Disabled" : 
                 "Success"}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                {toast.message}
              </p>
              
              {/* Action Button */}
              <div className="flex justify-end">
                <button 
                  onClick={() => setToast({ message: "", type: "" })}
                  className={`rounded-md px-8 py-2 text-sm font-semibold tracking-wide text-white transition-colors hover:opacity-90 ${
                    toast.type === "error" ? "bg-rose-500" : 
                    toast.type === "info" ? "bg-amber-500" : 
                    "bg-emerald-500"
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
            
          </div>
        </>,
        document.body
      )}

      {/* Security Review Modal */}
      {showSecurityModal && securityReview && createPortal(
        <>
          <div className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-11/12 max-w-lg rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4 bg-ink-50">
              <h3 className="text-xl font-bold text-ink-900">Security Review</h3>
              <button onClick={() => setShowSecurityModal(false)} className="text-ink-500 hover:text-ink-700 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6 rounded-lg bg-primary-50 p-4 border border-primary-100 flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-primary-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-primary-900">Two-Factor Authentication (2FA)</h4>
                  <p className="text-primary-700 text-sm mt-1">
                    Status: {securityReview.twoFactorEnabled ? <span className="font-bold text-emerald-600">Enabled</span> : <span className="font-bold text-rose-500">Disabled</span>}
                  </p>
                  {securityReview.twoFactorEnabledAt && (
                    <p className="text-primary-600 text-xs mt-1">
                      Enabled on: {new Date(securityReview.twoFactorEnabledAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <h4 className="font-bold text-ink-900 mb-4">Recent Security Activity</h4>
              {securityReview.recentActivity && securityReview.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {securityReview.recentActivity.map((log) => (
                    <div key={log._id} className="text-sm p-3 rounded-lg border border-ink-100 bg-white flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-ink-800">{log.event.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-ink-500 mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${log.success ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {log.success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-500 italic">No recent security events found.</p>
              )}
            </div>
            
            <div className="border-t border-ink-100 px-6 py-4 flex justify-end bg-ink-50">
              <Button onClick={() => setShowSecurityModal(false)}>Close</Button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
