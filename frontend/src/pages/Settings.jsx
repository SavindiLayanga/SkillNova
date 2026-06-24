import { Bell, BriefcaseBusiness, Lock, Mail, Save, ShieldCheck, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = await getToken();
        if (!token) throw new Error("No token found");
        
        const res = await fetch("http://localhost:5000/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
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

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
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
      showToast("Settings updated", "success");
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
                    Student authentication is stored locally for this prototype.
                    Backend authentication can replace this flow later.
                  </p>
                </div>
              </div>
              <Button variant="secondary">Review security</Button>
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

      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl border p-4 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-6 duration-300 ${
          toast.type === "error" 
            ? "bg-rose-50 border-rose-200 text-rose-800" 
            : "bg-emerald-50 border-emerald-200 text-emerald-800"
        }`}>
          {toast.type === "error" ? (
            <AlertCircle className="h-5 w-5 text-rose-600" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          )}
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
