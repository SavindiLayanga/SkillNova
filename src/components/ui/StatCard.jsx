const toneStyles = {
  primary: "bg-primary-50 text-primary-600",
  rose: "bg-rose-50 text-rose-600",
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
};

export default function StatCard({ icon: Icon, label, value, trend, tone }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-500">{label}</span>
        <span className={`rounded-lg p-2 ${toneStyles[tone]}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="text-3xl font-bold text-ink-900">{value}</p>
        <p className="rounded-full bg-ink-50 px-3 py-1 text-xs font-semibold text-ink-500">
          {trend}
        </p>
      </div>
    </div>
  );
}
