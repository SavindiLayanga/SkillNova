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
import { fetchDashboardStats } from "../../services/adminDashboardService.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const statIcons = [Users, FileText, ClipboardCheck, BriefcaseBusiness, BookOpen];
const statLinks = ["/admin/users", "/admin/cv-reviews", "/admin/jobs", "/admin/courses", "/admin/skills"];

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("Monthly");

  const getChartData = () => {
    if (!dashboardData?.chartData) return [];
    if (timeFilter === "Weekly") return dashboardData.chartData.weekly;
    if (timeFilter === "Yearly") return dashboardData.chartData.yearly;
    return dashboardData.chartData.monthly;
  };

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchDashboardStats();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
        setError("Failed to load live statistics. Data unavailable.");
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

      {loading || !dashboardData ? (
        <div className="py-10 text-center text-slate-500">Loading statistics...</div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {dashboardData.stats.map((stat, index) => {
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
              ["Pending CV reviews", dashboardData?.reviewWorkload?.pending || 0, "bg-amber-400"],
              ["Reviewed CVs", dashboardData?.reviewWorkload?.reviewed || 0, "bg-emerald-400"],
              ["Open job roles", dashboardData?.reviewWorkload?.openJobs || 0, "bg-blue-400"],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="text-slate-500">{value} total</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${Math.min(value > 0 ? (value / 100) * 100 : 0, 100)}%` }} // basic visualization
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
            {dashboardData?.recentActivity?.length > 0 ? (
              dashboardData.recentActivity.map((activity, idx) => (
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600" key={idx}>
                  {activity}
                </div>
              ))
            ) : (
              <div className="py-4 text-sm text-slate-500 text-center">No recent activity</div>
            )}
          </div>
        </AdminCard>
      </section>

      <section className="mt-8">
        <AdminCard>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">
              User Engagement Overview
            </h2>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Bar dataKey="CV Uploads" fill="#000000" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Progress Tracking" fill="#9ca3af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </section>
    </div>
  );
}
