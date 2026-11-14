import { useState, useMemo, useEffect } from "react";
import { Eye, PieChart as PieChartIcon, List, AlertCircle, X, ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import { fetchAdminCvReviews } from "../../services/adminCvReviewsService.js";
import Loader from "../../components/ui/Loader.jsx";

export default function AdminCvReviews() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewMode, setViewMode] = useState("list");
  const [adminCvReviews, setAdminCvReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
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
          <AdminCard key={review.id} className="transition-all hover:border-slate-300">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    {review.student}
                  </h2>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    review.status === "Pending"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : review.status === "Reviewed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {review.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400 truncate">
                  {review.fileName} • Uploaded {review.uploadedAt}
                </p>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600 line-clamp-2 min-h-[2.5rem]" title={review.summary}>
                  {review.summary}
                </p>
                
                <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Target Role</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate" title={review.targetRole}>
                      {review.targetRole}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Extracted Skills</p>
                    <div className="h-6 flex items-center gap-1.5 overflow-hidden">
                      {review.skills && review.skills.length > 0 ? (
                        <>
                          {review.skills.slice(0, 5).map((skill, i) => (
                            <span key={i} className="inline-block rounded bg-primary-50 text-primary-700 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap">
                              {typeof skill === 'string' ? skill : skill.name}
                            </span>
                          ))}
                          {review.skills.length > 5 && (
                            <button
                              onClick={() => setSelectedReview(review)}
                              className="inline-block rounded bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap transition-colors"
                              title="Click to view all skills"
                            >
                              +{review.skills.length - 5} more
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No skills extracted</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Score and Uniform View CV Button */}
              <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-3 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 w-full lg:w-36 lg:min-w-[144px] flex-shrink-0">
                <div className="text-left lg:text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Score
                  </p>
                  <p className="text-2xl lg:text-3xl font-black text-primary-600 leading-tight">
                    {review.score}%
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReview(review)}
                  className="h-9 w-28 lg:w-full flex-shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 whitespace-nowrap active:scale-95"
                  title="View CV Details"
                >
                  <Eye className="h-4 w-4 flex-shrink-0 text-slate-500" />
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
      {/* Detailed CV Preview Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-lg shadow-sm">
                  {selectedReview.student?.charAt(0).toUpperCase() || "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{selectedReview.student}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      selectedReview.status === "Pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {selectedReview.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedReview.fileName} • Uploaded {selectedReview.uploadedAt}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Score & Target Role Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-primary-50/60 border border-primary-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">Match Score</p>
                  <p className="text-3xl font-black text-primary-700">{selectedReview.score}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Target Role</p>
                  <p className="text-base font-bold text-slate-800 truncate">{selectedReview.targetRole || "Not specified"}</p>
                </div>
              </div>

              {/* Full Summary / AI Insights */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  AI Summary & Insights
                </h4>
                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 border border-slate-100">
                  {selectedReview.summary || "No summary available."}
                </div>
              </div>

              {/* All Extracted Skills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    All Extracted Skills ({selectedReview.skills?.length || 0})
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 max-h-48 overflow-y-auto">
                  {selectedReview.skills && selectedReview.skills.length > 0 ? (
                    selectedReview.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-white border border-slate-200 text-slate-700 px-2.5 py-1 text-xs font-medium shadow-2xs"
                      >
                        {typeof skill === "string" ? skill : skill.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills extracted</span>
                  )}
                </div>
              </div>

              {/* Missing Skills / Skills Gap (if any) */}
              {selectedReview.missingSkills && selectedReview.missingSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
                    Identified Skill Gaps ({selectedReview.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                    {selectedReview.missingSkills.map((gap, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-white border border-rose-200 text-rose-700 px-2.5 py-1 text-xs font-medium"
                      >
                        {typeof gap === "string" ? gap : gap.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <FileText className="h-4 w-4 text-slate-400" />
                <span>{selectedReview.fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedReview.fileUrl && (
                  <a
                    href={selectedReview.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Document
                  </a>
                )}
                <button
                  onClick={() => setSelectedReview(null)}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 shadow-xs transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
