import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import FormField from "../components/ui/FormField.jsx";

export default function ForgotPassword() {
  const [status, setStatus] = useState("idle"); // idle, submitted
  const [email, setEmail] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setEmail(formData.get("email"));
    
    // In a real app, you would make an API call to send a reset link.
    // For now, we just mock the success state.
    setStatus("submitted");
  }

  if (status === "submitted") {
    return (
      <Card className="w-full max-w-md p-8 text-center animate-fade-in-slide-up">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-ink-900">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          We sent a password reset link to <span className="font-semibold text-ink-900">{email}</span>. Please click the link to choose a new password.
        </p>
        <Link to="/login" className="mt-8 inline-block w-full">
          <Button className="w-full" variant="secondary" size="lg">
            Back to login
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md animate-fade-in-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">Reset password</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Enter your email address and we'll send you a link to reset your password.
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
        <Button className="w-full" size="lg" type="submit">
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Remember your password?{" "}
        <Link className="font-semibold text-primary-600 hover:text-primary-700" to="/login">
          Back to login
        </Link>
      </p>
    </Card>
  );
}
