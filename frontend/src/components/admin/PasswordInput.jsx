import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordInput({ label, name, placeholder }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <div className="flex rounded-lg border border-slate-200 bg-white focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-100">
        <input
          className="min-w-0 flex-1 rounded-l-lg px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          name={name}
          placeholder={placeholder}
          required
          type={isVisible ? "text" : "password"}
        />
        <button
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="flex w-12 items-center justify-center rounded-r-lg text-slate-500 hover:bg-slate-50"
          onClick={() => setIsVisible((value) => !value)}
          type="button"
        >
          {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </label>
  );
}
