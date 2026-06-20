import clsx from "../../utils/clsx.js";

export default function ProgressBar({ value, className }) {
  return (
    <div className={clsx("h-2.5 rounded-full bg-ink-100 shadow-inner overflow-hidden", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-700 ease-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
