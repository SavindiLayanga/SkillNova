import clsx from "../../utils/clsx.js";

const variants = {
  primary: "bg-[#252525] text-white shadow-md shadow-black/10 hover:bg-black hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5",
  secondary: "bg-white text-primary-900 border border-primary-200 hover:bg-primary-50 hover:border-primary-300 hover:-translate-y-0.5 shadow-sm",
  ghost: "text-primary-500 hover:bg-primary-50 hover:text-primary-900",
  danger: "bg-error text-white shadow-md shadow-error/20 hover:bg-error/90 hover:-translate-y-0.5",
  success: "bg-success text-white shadow-md shadow-success/20 hover:bg-success/90 hover:-translate-y-0.5",
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
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none",
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
