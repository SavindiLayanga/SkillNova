import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import FormField from "../../components/ui/FormField.jsx";
import useAdminAuth from "../../hooks/useAdminAuth.js";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await login(
        formData.get("username") ?? "",
        formData.get("password") ?? ""
      );
      navigate("/admin/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-primary-500/20">
      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-xl font-black text-white">
          S
        </div>
        <h1 className="text-3xl font-bold text-ink-900">Admin Sign In</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Sign in to the SkillNova operations console.
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormField
          label="Username"
          name="username"
          placeholder="admin_username"
          required
        />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink-700">
            Password
          </span>
          <div className="flex w-full overflow-hidden rounded-lg border border-ink-200 bg-white/95 transition focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-100">
            <input
              className="w-full flex-1 bg-transparent px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-500"
              name="password"
              placeholder="Enter password"
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex w-12 items-center justify-center text-ink-500 hover:text-ink-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </label>
        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in as admin"}
        </Button>
      </form>
    </Card>
  );
}
