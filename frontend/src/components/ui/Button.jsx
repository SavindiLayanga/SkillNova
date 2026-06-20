import clsx from "../../utils/clsx.js";

const variants = {
  primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 hover:-translate-y-0.5",
  secondary: "bg-white/80 backdrop-blur-sm text-ink-700 ring-1 ring-ink-200/50 hover:bg-white hover:shadow-sm hover:-translate-y-0.5",
  ghost: "text-ink-600 hover:bg-primary-50/50 hover:text-primary-700",
  dark: "bg-ink-900 text-white shadow-md hover:bg-ink-800 hover:-translate-y-0.5",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export default function Button({
  as: Component = "button",
  children,
  className,
  icon: Icon,
  size = "md",
  variant = "primary",
  type = "button",
  ...props
}) {
  const typeProp = Component === "button" ? { type } : {};

  return (
    <Component
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-200/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        variants[variant],
        sizes[size],
        className
      )}
      {...typeProp}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
      {children}
    </Component>
  );
}
