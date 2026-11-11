import { useState, useEffect } from "react";
import { X, Send, FileText, Award, Building, Mail, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Button from "./Button.jsx";
import { jobReadinessService } from "../../services/jobReadinessService.js";
import useAuth from "../../hooks/useAuth.js";

export default function ApplicationPreviewModal({ isOpen, onClose, job, onApplicationSent }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && job?._id) {
      setLoading(true);
      setError("");
      setSentSuccess(false);
      getToken()
        .then((token) => jobReadinessService.previewApplication(job._id, token))
        .then((data) => {
          setPreview(data);
          setCoverLetter(data.coverLetter || "");
        })
        .catch((err) => {
          setError(err.message || "Failed to load application preview.");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, job, getToken]);

  if (!isOpen) return null;

  const handleSend = async () => {
    setSending(true);
    setError("");
    try {
      const token = await getToken();
      const result = await jobReadinessService.applyToJob(job._id, coverLetter, token);
      setSentSuccess(true);
      if (onApplicationSent) {
        onApplicationSent(job._id, result);
      }
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || "Failed to send application. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-900">
                Job Application & CV Dispatch
              </h2>
              <p className="text-xs text-ink-500">
                Review and customize your tailored application before sending
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="rounded-lg p-2 text-ink-400 hover:bg-slate-200 hover:text-ink-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              <p className="text-sm font-medium text-ink-600">
                Generating tailored application & fetching CV details...
              </p>
            </div>
          ) : sentSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-ink-900">Application Sent Successfully!</h3>
              <p className="text-sm text-ink-600 max-w-md">
                Your cover letter and CV have been dispatched directly to <strong className="text-ink-800">{preview?.job?.company || job?.company}</strong>.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Target Job & Match Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-ink-900 flex items-center gap-2">
                      <Building size={16} className="text-primary-500" />
                      {job?.title || preview?.job?.title}
                    </h3>
                    <p className="text-xs font-medium text-ink-600 mt-0.5">
                      {job?.company || preview?.job?.company} • {job?.location || preview?.job?.location || "Remote"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                      <Sparkles size={12} />
                      {preview?.matchScore || job?.match || 80}% Match
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-ink-500 border-t border-slate-200/60 pt-2.5">
                  <Mail size={14} className="text-slate-400" />
                  <span>Sending to: <strong className="text-ink-700">{preview?.recipientEmail}</strong></span>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">
                  Attachments Included in Email
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink-900 truncate">Candidate CV / Resume</p>
                      <p className="text-[11px] text-emerald-600 font-medium">
                        {preview?.cvAvailable ? "✓ Attached from profile" : "Profile CV attached"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                      <Award size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink-900 truncate">SkillNova Verified Certificate</p>
                      <p className="text-[11px] text-ink-500">
                        {preview?.certificateAvailable ? "✓ Attached" : "Verification credentials included"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Cover Letter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Cover Letter & Email Body (Editable)
                  </label>
                  <span className="text-[11px] text-ink-400">
                    Auto-generated based on your verified skills & job match
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Cover letter content..."
                  className="w-full rounded-xl border border-slate-300 p-3.5 text-xs text-ink-800 leading-relaxed font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-slate-50/30"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!sentSuccess && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              icon={Send}
              onClick={handleSend}
              disabled={loading || sending}
            >
              {sending ? "Sending Application & CV..." : "Send Application with CV"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
