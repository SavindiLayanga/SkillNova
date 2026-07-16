import { useState } from "react";
import { Eye } from "lucide-react";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import { adminCvReviews } from "../../data/adminDummyData.js";

export default function AdminCvReviews() {
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredReviews = filterStatus === "All"
    ? adminCvReviews
    : adminCvReviews.filter((review) => review.status === filterStatus);
  return (
    <div>
      <AdminPageHeader
        description="Review uploaded CVs and inspect the generated analysis summary."
        title="CV Reviews"
      />

      <div className="mb-6 flex justify-end">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Reviewed">Reviewed</option>
        </select>
      </div>

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
                      : "bg-emerald-50 text-emerald-700"
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
    </div>
  );
}
