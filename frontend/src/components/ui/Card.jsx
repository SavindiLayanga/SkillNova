import clsx from "../../utils/clsx.js";

export default function Card({ children, className }) {
  return (
    <section
      className={clsx(
        "rounded-2xl border border-white/60 bg-white/70 p-5 shadow-soft backdrop-blur-xl transition-all duration-300 hover:shadow-glass hover:bg-white/80 sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}
