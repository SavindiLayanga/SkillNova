import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import FormField from "../components/ui/FormField.jsx";
import useAuth from "../hooks/useAuth.js";

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      await signup({
        email: formData.get("email"),
        experience: formData.get("experience"),
        name: formData.get("name"),
        password: formData.get("password"),
        targetRole: formData.get("targetRole"),
      });
      navigate("/dashboard", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-xl font-black text-white">
          S
        </div>
        <h1 className="text-3xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Tell SkillNova where you are now and where you want to go next.
        </p>
      </div>
      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
        <FormField label="Full name" name="name" placeholder="Your name" required />
        <FormField
          label="Email address"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <FormField
          label="Password"
          minLength="6"
          name="password"
          placeholder="Create password"
          required
          type="password"
        />
        <FormField
          label="Target role"
          name="targetRole"
          placeholder="Junior React Developer"
          required
        />
        <FormField
          className="sm:col-span-2"
          label="Current education or experience"
          name="experience"
          placeholder="Final year software engineering student"
          required
        />
        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:col-span-2">
            {error}
          </p>
        ) : null}
        <Button className="sm:col-span-2" size="lg" type="submit">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link className="font-semibold text-primary-600" to="/login">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
