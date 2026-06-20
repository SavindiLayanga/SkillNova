import clsx from "../../utils/clsx.js";

export default function FormField({
  className,
  label,
  textarea = false,
  ...props
}) {
  const Control = textarea ? "textarea" : "input";

  return (
    <label className={clsx("block", className)}>
      <span className="mb-2 block text-sm font-semibold text-ink-700">
        {label}
      </span>
      <Control
        className="w-full rounded-lg border border-ink-200 bg-white/95 px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-500 focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
        {...props}
      />
    </label>
  );
}
