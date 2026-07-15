import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  Users,
} from "lucide-react";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import { adminActivity } from "../../data/adminDummyData.js";
import { fetchDashboardStats } from "../../services/adminDashboardService.js";

const statIcons = [Users, FileText, ClipboardCheck, BriefcaseBusiness, BookOpen];
const statLinks = ["/admin/users", "/admin/cv-reviews", "/admin/jobs", "/admin/courses", "/admin/skills"];

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
        setError("Failed to load live statistics. Displaying fallback data.");
        // Fallback data so the cards are always visible
        setStats([
          { label: "Total Users", value: 0, change: "Data unavailable" },
          { label: "Total CV Uploads", value: 0, change: "Data unavailable" },
          { label: "Total Jobs", value: 0, change: "Data unavailable" },
          { label: "Total Courses", value: 0, change: "Data unavailable" },
          { label: "Total Skills", value: 0, change: "Data unavailable" }
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <AdminPageHeader
        description="Monitor platform activity, CV review workload, and recommendation content."
        title="Admin Dashboard"
      />

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-500">Loading statistics...</div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat, index) => {
            const Icon = statIcons[index % statIcons.length];
            const linkTarget = statLinks[index % statLinks.length];

            return (
              <Link to={linkTarget} key={stat.label} className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-2xl block transition-transform hover:-translate-y-1">
                <AdminCard className="min-h-36 h-full hover:bg-slate-50 cursor-pointer transition-colors">
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
              </Link>
            );
          })}
        </section>
      )}

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
