import clsx from "../../utils/clsx.js";

export default function AdminCard({ children, className }) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-[2px] sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}
