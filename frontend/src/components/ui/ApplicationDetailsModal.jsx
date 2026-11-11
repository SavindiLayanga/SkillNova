import { X, Building, Mail, CheckCircle2, FileText, Calendar, Sparkles } from "lucide-react";
import Button from "./Button.jsx";

export default function ApplicationDetailsModal({ isOpen, onClose, application }) {
  if (!isOpen || !application) return null;

  const job = application.jobId || {};
  const sentDate = application.sentAt || application.createdAt;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-900">
                Dispatched Application Details
              </h2>
              <p className="text-xs text-ink-500">
                Record of application and CV sent to employer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink-400 hover:bg-slate-200 hover:text-ink-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-ink-900 flex items-center gap-2">
                  <Building size={16} className="text-primary-500" />
                  {job.title || "Job Application"}
                </h3>
                <p className="text-xs text-ink-600 mt-0.5">
                  {job.company || "Employer"} • {job.location || "Remote"}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                {application.jobMatchScore || 85}% Match
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-500 border-t border-slate-200 pt-2.5">
              <span className="flex items-center gap-1">
                <Mail size={13} className="text-slate-400" />
                {application.companyEmail}
              </span>
              {sentDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  {new Date(sentDate).toLocaleDateString()} {new Date(sentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <span className="flex items-center gap-1 text-primary-600 font-medium">
                <Sparkles size={13} />
                Mode: {application.appliedVia === 'auto' ? 'Auto-Dispatched on Score Match' : 'Direct Application with CV'}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2 flex items-center gap-1.5">
              <FileText size={14} /> Sent Cover Letter / Email Body
            </h4>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs font-mono text-ink-800 leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto">
              {application.coverLetter || "Standard SkillNova introduction and verified candidate profile sent with CV attachment."}
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>CV and verified credentials were included with this submission. Status: <strong>{application.status}</strong>.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
