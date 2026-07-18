import { LogOut, ShieldAlert, Edit3, User, Mail, Phone, Shield, Clock, Camera, Globe, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import useAdminAuth from "../../hooks/useAdminAuth.js";

export default function AdminSettings() {
  const { logout, adminUser } = useAdminAuth();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en");

  useEffect(() => {
    setSelectedLanguage(i18n.language || "en");
  }, [i18n.language]);

  const handleSaveLanguage = () => {
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem("i18nextLng", selectedLanguage);
  };
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

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
                    {t("settings.profile.lastLogin")}: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <Button icon={Edit3} variant="outline" className="shrink-0">
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
              <h2 className="text-lg font-bold text-slate-950">{t("settings.language.title")}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 mb-4">
                {t("settings.language.desc")}
              </p>
              
              <div className="flex items-center gap-3 max-w-sm">
                <select 
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="si-LK">සිංහල</option>
                  <option value="es">Español</option>
                  <option value="hi">हिन्दी</option>
                  <option value="zh-CN">中文 (简体)</option>
                </select>
                <Button onClick={handleSaveLanguage} icon={Save}>
                  {t("settings.language.saveBtn")}
                </Button>
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
    </div>
  );
}
