import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  Users,
} from "lucide-react";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import { adminActivity, adminStats } from "../../data/adminDummyData.js";

const statIcons = [Users, FileText, ClipboardCheck, BriefcaseBusiness, BookOpen];

export default function AdminDashboard() {
  return (
    <div>
      <AdminPageHeader
        description="Monitor platform activity, CV review workload, and recommendation content."
        title="Admin Dashboard"
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {adminStats.map((stat, index) => {
          const Icon = statIcons[index];

          return (
            <AdminCard className="min-h-36" key={stat.label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {stat.value}
                  </p>
                </div>
                <span className="rounded-lg bg-primary-50 p-2 text-primary-600">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500">{stat.change}</p>
            </AdminCard>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <AdminCard>
          <h2 className="text-lg font-bold text-slate-950">
            Review workload
          </h2>
          <div className="mt-6 space-y-4">
            {[
              ["Pending CV reviews", 68, "bg-amber-400"],
              ["Reviewed CVs", 82, "bg-emerald-400"],
              ["Open job roles", 56, "bg-blue-400"],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="text-slate-500">{value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="text-lg font-bold text-slate-950">
            Recent user activity
          </h2>
          <div className="mt-5 space-y-3">
            {adminActivity.map((activity) => (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600" key={activity}>
                {activity}
              </div>
            ))}
          </div>
        </AdminCard>
      </section>
    </div>
  );
}
