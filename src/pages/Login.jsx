import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import FormField from "../components/ui/FormField.jsx";
import useAuth from "../hooks/useAuth.js";

export default function Login() {
  const { signin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      signin(formData.get("email"), formData.get("password"));
      navigate(location.state?.from?.pathname ?? "/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-xl font-black text-white">
          S
        </div>
        <h1 className="text-3xl font-bold text-ink-900">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Sign in to continue building your career roadmap.
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormField
          label="Email address"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <FormField
          label="Password"
          name="password"
          placeholder="Enter password"
          required
          type="password"
        />
        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-500">
            <input
              className="h-4 w-4 rounded border-ink-200 text-primary-500 focus:ring-primary-400"
              type="checkbox"
            />
            Remember me
          </label>
          <Link className="font-semibold text-primary-600 hover:text-primary-700" to="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <Button className="w-full" size="lg" type="submit">
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        New to SkillNova?{" "}
        <Link className="font-semibold text-primary-600" to="/register">
          Create account
        </Link>
      </p>
    </Card>
  );
}
