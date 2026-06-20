import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import { adminCvReviews } from "../../data/adminDummyData.js";

export default function AdminCvReviews() {
  return (
    <div>
      <AdminPageHeader
        description="Review uploaded CVs and inspect the generated analysis summary."
        title="CV Reviews"
      />

      <div className="grid gap-4">
        {adminCvReviews.map((review) => (
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
              <div className="rounded-lg bg-slate-50 p-4 text-center lg:w-32">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Score
                </p>
                <p className="mt-2 text-3xl font-bold text-primary-600">
                  {review.score}%
                </p>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
