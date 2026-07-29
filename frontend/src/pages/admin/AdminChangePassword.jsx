import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import PasswordInput from "../../components/admin/PasswordInput.jsx";
import FormField from "../../components/ui/FormField.jsx";
import Button from "../../components/ui/Button.jsx";
import useAdminAuth from "../../hooks/useAdminAuth.js";

export default function AdminChangePassword() {
  const { changeCredentials, adminUser, isDefaultPassword } = useAdminAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);

    try {
      await changeCredentials(
        formData.get("currentPassword") ?? "",
        formData.get("newUsername") ?? "",
        formData.get("newPassword") ?? "",
        formData.get("confirmPassword") ?? ""
      );
      setSuccess("Admin credentials updated successfully.");
      setTimeout(() => navigate("/admin/dashboard", { replace: true }), 1000);
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <AdminPageHeader
          description={
            isDefaultPassword
              ? "Create a strong admin password and unique username before accessing the management dashboard."
              : "Update your admin username and password. You must verify your current password to make changes."
          }
          title="Change Admin Credentials"
        />

        {isDefaultPassword ? (
          <div className="mb-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            You are using the default admin password. Please change it before
            continuing.
          </div>
        ) : null}

        <AdminCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Security settings
              </h2>
              <p className="text-sm text-slate-500">
                You can change your username and password here. Leave the new password fields blank if you only want to change your username, and vice versa.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="border-b border-slate-200 pb-5 mb-5">
              <PasswordInput
                label="Current password (Required)"
                name="currentPassword"
                placeholder="Enter current password to verify identity"
              />
            </div>

            <FormField
              label="New Username (Optional)"
              name="newUsername"
              defaultValue={adminUser?.username || ""}
              placeholder="Enter new username"
            />
            <PasswordInput
              label="New password (Optional)"
              name="newPassword"
              placeholder="Create strong password"
            />
            <PasswordInput
              label="Confirm new password"
              name="confirmPassword"
              placeholder="Confirm new password"
            />
            {error ? (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </p>
            ) : null}
            <Button size="lg" type="submit">
              Update credentials
            </Button>
          </form>
        </AdminCard>
      </div>
    </div>
  );
}
