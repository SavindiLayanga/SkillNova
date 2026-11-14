import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  Users,
  Award,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Briefcase
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

      {/* 🌟 Special UI for Industry-Ready Candidates (Score >= 90%) */}
      <section className="mt-8">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/60 via-white to-primary-50/30 p-5 sm:p-6 shadow-xs backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-100">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm ring-4 ring-emerald-100">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Industry-Ready Talent Hub
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-300">
                    Score ≥ 90%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-potential candidates who completed skill assessments, cleared skill gaps, and are ready for placement.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-100/70 text-emerald-800 font-bold px-3 py-1.5 text-xs border border-emerald-200 shadow-2xs">
                {dashboardData?.jobReadyCandidates?.length || 0} Candidates Qualified
              </span>
            </div>
          </div>

          {/* Candidate List Cards */}
          {dashboardData?.jobReadyCandidates && dashboardData.jobReadyCandidates.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {dashboardData.jobReadyCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex flex-col justify-between rounded-xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-lg shadow-sm">
                          {candidate.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900 capitalize truncate">
                            {candidate.name}
                          </h3>
                          <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5 truncate">
                            <Briefcase className="h-3.5 w-3.5 shrink-0" />
                            <span>{candidate.targetRole}</span>
                          </p>
                        </div>
                      </div>

                      {/* Score Pill */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-sm font-black text-emerald-700 shadow-2xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          {candidate.score}% Ready
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                          Industry Ready
                        </span>
                      </div>
                    </div>

                    {/* Verified skills / status badges */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">Skills:</span>
                      {candidate.skills && candidate.skills.length > 0 ? (
                        candidate.skills.slice(0, 4).map((sk, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-medium"
                          >
                            {typeof sk === "string" ? sk : sk.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Core skills verified</span>
                      )}
                      {candidate.skills?.length > 4 && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                          +{candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 truncate max-w-[150px]">
                      {candidate.email}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/users/${candidate.userId}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>Issue Certificate</span>
                      </Link>
                      <Link
                        to={`/admin/users/${candidate.userId}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        title="View Student Profile"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        <span>Profile</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-emerald-200 bg-white/70 p-6 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-emerald-400 mb-1.5" />
              <p className="text-sm font-semibold text-slate-700">No candidates have reached ≥90% readiness yet.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                When students clear their skill gaps and reach 90% or higher, they will immediately appear here with real-time alert notifications.
              </p>
            </div>
          )}
        </div>
      </section>

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
