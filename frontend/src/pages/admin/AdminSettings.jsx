import { LogOut, ShieldAlert, Edit3, User, Mail, Phone, Shield, Clock, Camera, Globe, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import useAdminAuth from "../../hooks/useAdminAuth.js";
import { formatDate } from "../../utils/dateUtils.js";

import { usePreferences } from "../../context/PreferencesContext.jsx";

export default function AdminSettings() {
  const { logout, adminUser, updateProfile } = useAdminAuth();
  const { t, i18n } = useTranslation();
  const { preferences, updatePreferences } = usePreferences();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    language: "en",
    timezone: "",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    currency: "LKR",
  });

  useEffect(() => {
    if (preferences) {
      setPrefs({
        language: preferences.language || "en",
        timezone: preferences.timezone || "",
        dateFormat: preferences.dateFormat || "DD/MM/YYYY",
        timeFormat: preferences.timeFormat || "12h",
        currency: preferences.currency || "LKR",
      });
    }
  }, [preferences]);

  const handlePreferenceChange = (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleSavePreferences = () => {
    if (prefs.language !== i18n.language) {
      i18n.changeLanguage(prefs.language);
      localStorage.setItem("i18nextLng", prefs.language);
    }
    updatePreferences(prefs);
  };
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  const openEditModal = () => {
    setEditFormData({
      name: adminUser?.name || adminUser?.username || "",
      phone: adminUser?.phone || ""
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(editFormData);
      setIsEditModalOpen(false);
    } catch (error) {
      alert(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        description={t("settings.description")}
        title={t("settings.title")}
      />

      {/* Admin Profile Section */}
      <section className="mb-6">
        <AdminCard>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                  {adminUser?.profileImage ? (
                    <img src={adminUser.profileImage} alt="Admin" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-primary-700 transition">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{adminUser?.name || adminUser?.username || "Admin User"}</h2>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {adminUser?.email || t("settings.profile.noEmail")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {adminUser?.phone || "+94 77 123 4567"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <span className="capitalize">{adminUser?.role?.replace('_', ' ') || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {t("settings.profile.lastLogin")}: {formatDate(new Date(), preferences)}
                  </div>
                </div>
              </div>
            </div>

            <Button icon={Edit3} variant="outline" className="shrink-0" onClick={openEditModal}>
              {t("settings.profile.editBtn")}
            </Button>
          </div>
        </AdminCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                {t("settings.security.title")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {t("settings.security.desc")}
              </p>
              <Button as={Link} className="mt-5" to="/admin/change-password">
                {t("settings.security.changePassword")}
              </Button>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Globe className="h-5 w-5" />
            </div>
            <div className="w-full">
              <h2 className="text-lg font-bold text-slate-950">User Preferences</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 mb-4">
                Manage your system-wide preferences including language, timezone, and date formats.
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                  <select 
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={prefs.language}
                    onChange={(e) => handlePreferenceChange("language", e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="si-LK">සිංහල</option>
                    <option value="es">Español</option>
                    <option value="hi">हिन्दी</option>
                    <option value="zh-CN">中文 (简体)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                  <select 
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={prefs.timezone}
                    onChange={(e) => handlePreferenceChange("timezone", e.target.value)}
                  >
                    <option value="">Browser Default</option>
                    <option value="Asia/Colombo">🇱🇰 Sri Lanka (Asia/Colombo) UTC+05:30</option>
                    <option value="Europe/London">🇬🇧 United Kingdom (Europe/London) UTC+00:00</option>
                    <option value="America/New_York">🇺🇸 United States (America/New_York) UTC-05:00</option>
                    <option value="Asia/Dubai">🇦🇪 UAE (Asia/Dubai) UTC+04:00</option>
                    <option value="Australia/Sydney">🇦🇺 Australia (Australia/Sydney) UTC+10:00</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date Format</label>
                  <select 
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={prefs.dateFormat}
                    onChange={(e) => handlePreferenceChange("dateFormat", e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (18/07/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (07/18/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-18)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time Format</label>
                  <select 
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={prefs.timeFormat}
                    onChange={(e) => handlePreferenceChange("timeFormat", e.target.value)}
                  >
                    <option value="12h">12-hour (05:30 PM)</option>
                    <option value="24h">24-hour (17:30)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select 
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={prefs.currency}
                    onChange={(e) => handlePreferenceChange("currency", e.target.value)}
                  >
                    <option value="LKR">LKR (Sri Lankan Rupee)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Button onClick={handleSavePreferences} icon={Save} className="mt-2">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="text-lg font-bold text-slate-950">{t("settings.session.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t("settings.session.desc")}
          </p>
          <Button
            className="mt-5"
            icon={LogOut}
            onClick={handleLogout}
            variant="secondary"
          >
            {t("settings.session.logout")}
          </Button>
        </AdminCard>
      </section>
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <AdminCard className="w-full max-w-md">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Phone</span>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                />
              </label>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </AdminCard>
        </div>
      )}
    </div>
  );
}
