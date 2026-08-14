import { useState, useMemo, useEffect } from "react";
import { Eye, PieChart as PieChartIcon, List, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import { fetchAdminCvReviews } from "../../services/adminCvReviewsService.js";
import Loader from "../../components/ui/Loader.jsx";

export default function AdminCvReviews() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewMode, setViewMode] = useState("list");
  const [adminCvReviews, setAdminCvReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await fetchAdminCvReviews();
        setAdminCvReviews(data);
      } catch (err) {
        console.error("Failed to load CV reviews:", err);
        setError("Failed to load CV reviews.");
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const filteredReviews = filterStatus === "All"
    ? adminCvReviews
    : adminCvReviews.filter((review) => review.status === filterStatus);

  const chartData = useMemo(() => {
    const counts = { Pending: 0, Reviewed: 0, "In Learning Path": 0 };
    adminCvReviews.forEach(r => {
      if (counts[r.status] !== undefined) counts[r.status]++;
    });
    return [
      { name: 'Pending', value: counts.Pending, color: '#f59e0b' },
      { name: 'Reviewed', value: counts.Reviewed, color: '#10b981' },
      { name: 'In Learning Path', value: counts["In Learning Path"], color: '#3b82f6' }
    ];
  }, [adminCvReviews]);

  if (loading) {
    return <Loader text="Loading CV reviews..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-900">Oops!</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        description="Review uploaded CVs and inspect the generated analysis summary."
        title="CV Reviews"
      />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'chart' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <PieChartIcon className="h-4 w-4" />
            Chart
          </button>
        </div>

        {viewMode === 'list' && (
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="In Learning Path">In Learning Path</option>
          </select>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="grid gap-4">
        {filteredReviews.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            No CVs found for the selected status.
          </div>
        ) : (
          filteredReviews.map((review) => (
          <AdminCard key={review.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-950">
                    {review.student}
                  </h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    review.status === "Pending"
                      ? "bg-amber-50 text-amber-700"
                      : review.status === "Reviewed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                  }`}>
                    {review.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {review.fileName} - uploaded {review.uploadedAt}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {review.summary}
                </p>
                
                <div className="mt-4 grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Target Role</p>
                    <p className="text-sm font-medium text-slate-900">{review.targetRole}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Extracted Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {review.skills && review.skills.length > 0 ? (
                        review.skills.map((skill, i) => (
                          <span key={i} className="rounded bg-primary-50 text-primary-700 px-2 py-0.5 text-[11px] font-semibold">
                            {typeof skill === 'string' ? skill : skill.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No skills extracted</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 rounded-lg bg-slate-50 p-4 lg:w-32">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    Score
                  </p>
                  <p className="mt-1 text-3xl font-bold text-primary-600">
                    {review.score}%
                  </p>
                </div>
                <button
                  onClick={() => alert(`Viewing document: ${review.fileName}`)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-white border border-slate-200 py-1.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-primary-600 transition-colors"
                  title="View CV Document"
                >
                  <Eye className="h-4 w-4" />
                  <span>View CV</span>
                </button>
              </div>
            </div>
          </AdminCard>
        )))}
      </div>
      ) : (
        <div className="h-96 w-full rounded-lg border border-slate-100 bg-slate-50 p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold text-slate-900 mb-4">CV Status Distribution</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip cursor={{fill: '#f8fafc'}} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
