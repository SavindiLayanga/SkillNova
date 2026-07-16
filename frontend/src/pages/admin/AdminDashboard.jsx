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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const userEngagementDataWeekly = [
  { name: 'Mon', 'CV Uploads': 12, 'Progress Tracking': 5 },
  { name: 'Tue', 'CV Uploads': 15, 'Progress Tracking': 8 },
  { name: 'Wed', 'CV Uploads': 20, 'Progress Tracking': 12 },
  { name: 'Thu', 'CV Uploads': 18, 'Progress Tracking': 10 },
  { name: 'Fri', 'CV Uploads': 25, 'Progress Tracking': 15 },
  { name: 'Sat', 'CV Uploads': 30, 'Progress Tracking': 22 },
  { name: 'Sun', 'CV Uploads': 28, 'Progress Tracking': 20 },
];

const userEngagementDataMonthly = [
  { name: 'Jan', 'CV Uploads': 45, 'Progress Tracking': 20 },
  { name: 'Feb', 'CV Uploads': 55, 'Progress Tracking': 35 },
  { name: 'Mar', 'CV Uploads': 80, 'Progress Tracking': 50 },
  { name: 'Apr', 'CV Uploads': 110, 'Progress Tracking': 70 },
  { name: 'May', 'CV Uploads': 125, 'Progress Tracking': 84 },
  { name: 'Jun', 'CV Uploads': 140, 'Progress Tracking': 105 },
];

const userEngagementDataYearly = [
  { name: '2021', 'CV Uploads': 200, 'Progress Tracking': 50 },
  { name: '2022', 'CV Uploads': 350, 'Progress Tracking': 120 },
  { name: '2023', 'CV Uploads': 500, 'Progress Tracking': 250 },
  { name: '2024', 'CV Uploads': 800, 'Progress Tracking': 450 },
];

const statIcons = [Users, FileText, ClipboardCheck, BriefcaseBusiness, BookOpen];
const statLinks = ["/admin/users", "/admin/cv-reviews", "/admin/jobs", "/admin/courses", "/admin/skills"];

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("Monthly");

  const getChartData = () => {
    if (timeFilter === "Weekly") return userEngagementDataWeekly;
    if (timeFilter === "Yearly") return userEngagementDataYearly;
    return userEngagementDataMonthly;
  };

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
                <Bar dataKey="CV Uploads" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Progress Tracking" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </section>
    </div>
  );
}
