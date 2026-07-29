import clsx from "../../utils/clsx.js";

export default function Card({ children, className }) {
  return (
    <section
      className={clsx(
        "rounded-[24px] bg-white p-5 shadow-soft transition-all duration-300 hover:shadow-md sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}
