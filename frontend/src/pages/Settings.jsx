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
    title: "Recommendation Preferences",
    description: "Control how SkillNova prioritizes course and job suggestions.",
    icon: BriefcaseBusiness,
    items: [
      { label: "Show remote jobs first", key: "showRemoteJobsFirst" },
      { label: "Use CV data for match scoring", key: "useCVDataForMatchScoring" },
      { label: "Prioritize beginner-friendly learning paths", key: "prioritizeBeginnerFriendlyPaths" },
    ],
  }
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

  const handleSettingChange = async (key, value) => {
    const previousValue = settings?.[key];
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      const token = await getToken();
      if (!token) throw new Error("No token found");

      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ [key]: value })
      });
      if (!res.ok) throw new Error("Failed to update");
      showToast("Settings updated successfully.", "success");
    } catch (error) {
      console.error("Failed to update setting", error);
      setSettings((prev) => ({ ...prev, [key]: previousValue }));
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
            <div className="space-y-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink-900">
                      Notification Preferences
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">
                      Choose which types of alerts and updates you want to receive.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-10 border-t border-ink-100 pt-8 mt-6">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wider mb-4">
                       Activity & Recommendations
                    </h3>
                    <div className="rounded-xl border border-ink-200 bg-white divide-y divide-ink-100 overflow-hidden shadow-sm">
                      {[
                        { label: "Job Match Alerts", key: "newJobMatchAlerts", desc: "Alerts when new matching jobs are found." },
                        { label: "Course Recommendation Alerts", key: "courseRecommendations", desc: "Personalized learning path updates." },
                        { label: "CV Review Updates", key: "cvReviewUpdates", desc: "Feedback on your uploaded resumes." },
                        { label: "Skill Assessment Results", key: "skillAssessmentResults", desc: "Results and feedback from your tests." },
                        { label: "Learning Reminders", key: "learningProgressReminders", desc: "Nudges to keep your streak alive." },
                        { label: "Course Completion Reminders", key: "courseCompletionReminders", desc: "Reminders to finish active courses." },
                      ].map((item) => {
                         const checked = settings?.[item.key] ?? false;
                         return (
                          <div key={item.key} className="flex items-center justify-between p-4 transition-colors hover:bg-ink-50/50 cursor-pointer" onClick={() => handleToggle(item.key, checked)}>
                            <div>
                              <p className="text-sm font-semibold text-ink-900">{item.label}</p>
                              <p className="text-xs text-ink-500 mt-0.5">{item.desc}</p>
                            </div>
                            <button
                              type="button"
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary-600' : 'bg-ink-200'}`}
                              role="switch"
                              aria-checked={checked}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>
                         );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wider mb-4">
                       System Updates
                    </h3>
                    <div className="rounded-xl border border-ink-200 bg-white divide-y divide-ink-100 overflow-hidden shadow-sm">
                      {[
                        { label: "Weekly Progress Summary", key: "weeklyCareerDigest", desc: "A summary of your week's progress." },
                        { label: "Security Alerts", key: "securityAlerts", desc: "Important notices about your account security." },
                        { label: "New Feature Announcements", key: "announcementsNewFeatures", desc: "Updates on SkillNova platform changes." },
                      ].map((item) => {
                         const checked = settings?.[item.key] ?? false;
                         return (
                          <div key={item.key} className="flex items-center justify-between p-4 transition-colors hover:bg-ink-50/50 cursor-pointer" onClick={() => handleToggle(item.key, checked)}>
                            <div>
                              <p className="text-sm font-semibold text-ink-900">{item.label}</p>
                              <p className="text-xs text-ink-500 mt-0.5">{item.desc}</p>
                            </div>
                            <button
                              type="button"
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary-600' : 'bg-ink-200'}`}
                              role="switch"
                              aria-checked={checked}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                          </div>
                         );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink-900">
                      Communication Settings
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">
                      Choose how and when SkillNova contacts you across different channels.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-10 border-t border-ink-100 pt-8 mt-6 pb-12">
                
                {/* Delivery Methods */}
                <div>
                  <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wider mb-4">
                    Delivery Channels
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { label: "Email", key: "emailNotifications" },
                      { label: "Push", key: "pushNotifications" },
                      { label: "SMS", key: "smsNotifications" },
                    ].map((item) => {
                      const checked = settings?.[item.key] ?? (item.key === 'emailNotifications');
                      return (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-ink-200 hover:border-ink-300 transition-colors shadow-sm cursor-pointer" onClick={() => handleToggle(item.key, checked)}>
                          <span className="text-sm font-semibold text-ink-900">{item.label}</span>
                          <button
                            type="button"
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary-600' : 'bg-ink-200'}`}
                            role="switch"
                            aria-checked={checked}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                      <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wider mb-4">
                         Frequency & Timing
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Delivery Frequency</label>
                          <div className="flex rounded-lg border border-ink-200 bg-white overflow-hidden divide-x divide-ink-200 shadow-sm">
                            {["Real-time", "Daily", "Weekly", "Important Only"].map((freq) => {
                              const isActive = (settings?.notificationFrequency || "Real-time") === freq;
                              return (
                                <button
                                  key={freq}
                                  onClick={() => handleSettingChange("notificationFrequency", freq)}
                                  className={`flex-1 p-2 text-xs font-semibold focus:outline-none transition-colors ${
                                    isActive 
                                      ? 'bg-primary-50 text-primary-700' 
                                      : 'text-ink-600 hover:bg-ink-50'
                                  }`}
                                >
                                  {freq}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Quiet Hours</label>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <input 
                                type="time" 
                                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm" 
                                value={settings?.quietHoursStart || "22:00"}
                                onChange={(e) => handleSettingChange("quietHoursStart", e.target.value)}
                              />
                              <p className="mt-2 text-[10px] font-bold text-ink-500 uppercase tracking-wider">Pause at</p>
                            </div>
                            <div className="flex-1">
                              <input 
                                type="time" 
                                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-sm" 
                                value={settings?.quietHoursEnd || "07:00"}
                                onChange={(e) => handleSettingChange("quietHoursEnd", e.target.value)}
                              />
                              <p className="mt-2 text-[10px] font-bold text-ink-500 uppercase tracking-wider">Resume at</p>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
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
