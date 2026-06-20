import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../components/admin/PasswordInput.jsx";
import Button from "../../components/ui/Button.jsx";
import useAdminAuth from "../../hooks/useAdminAuth.js";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      const result = login(
        formData.get("username") ?? "",
        formData.get("password") ?? ""
      );
      navigate(
        result.isDefaultPassword ? "/admin/change-password" : "/admin/dashboard",
        { replace: true }
      );
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-2xl bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-slate-900 p-8 text-white sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-xl font-black">
              S
            </div>
            <h1 className="mt-10 text-4xl font-bold leading-tight">
              SkillNova admin operations console
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Manage users, CV reviews, jobs, courses, and security settings
              from a separate protected admin workspace.
            </p>
            <div className="mt-8 rounded-lg border border-primary-400/40 bg-primary-500/10 p-4 text-sm leading-6 text-primary-100">
              Prototype credentials: username <strong>admin</strong>, password{" "}
              <strong>Admin@12345</strong>.
            </div>
          </section>

          <section className="p-8 text-slate-900 sm:p-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Admin sign in</h2>
                <p className="text-sm text-slate-500">
                  Student credentials do not work here.
                </p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Username
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                  name="username"
                  placeholder="admin"
                  required
                />
              </label>
              <PasswordInput
                label="Password"
                name="password"
                placeholder="Enter admin password"
              />
              {error ? (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </p>
              ) : null}
              <Button className="w-full" size="lg" type="submit">
                Sign in as admin
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
