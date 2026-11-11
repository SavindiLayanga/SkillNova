import { useState, useEffect } from "react";
import { Award, CheckCircle, Mail, AlertTriangle, FileText, Sparkles, ExternalLink } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Loader from "../components/ui/Loader.jsx";
import ApplicationDetailsModal from "../components/ui/ApplicationDetailsModal.jsx";
import useAuth from "../hooks/useAuth.js";

export default function JobReadiness() {
  const { user, getToken } = useAuth();
  const [readiness, setReadiness] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [introductions, setIntroductions] = useState([]);
  const [selectedIntro, setSelectedIntro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [resReady, resCerts, resIntros] = await Promise.all([
        fetch("http://localhost:5000/api/job-readiness", { headers }),
        fetch("http://localhost:5000/api/job-readiness/certificates", { headers }),
        fetch("http://localhost:5000/api/job-readiness/introductions", { headers })
      ]);

      if (resReady.ok) setReadiness(await resReady.json());
      if (resCerts.ok) setCertificates(await resCerts.json());
      if (resIntros.ok) setIntroductions(await resIntros.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/job-readiness/evaluate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) return <Loader text="Loading Job Readiness..." />;

  const isReady = readiness?.isJobReady;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Job Readiness & Employer Applications"
        description="Track your progress towards becoming job-ready and manage automated CV applications."
        eyebrow="Career Automation"
        action={
          <Button onClick={handleEvaluate} disabled={evaluating}>
            {evaluating ? "Evaluating..." : "Evaluate Readiness"}
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col items-center text-center p-8">
          <div className={`p-4 rounded-full mb-4 ${isReady ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {isReady ? <CheckCircle size={48} /> : <AlertTriangle size={48} />}
          </div>
          <h2 className="text-2xl font-bold text-ink-900 mb-2">
            {isReady ? "You are Job Ready!" : "Not Yet Job Ready"}
          </h2>
          <p className="text-ink-500 mb-6">
            {isReady 
              ? "You've met all skill requirements! The system can automatically match and dispatch your CV to top employers."
              : "Keep improving your skills and taking assessments to reach the 90% benchmark."}
          </p>
          <div className="text-4xl font-extrabold text-primary-600">
            {readiness?.score || 0}%
          </div>
          <span className="text-sm font-semibold text-ink-400 mt-2">Overall Job Readiness Score</span>

          {readiness?.targetRole && (
            <div className="mt-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-700">
              Target Role: {readiness.targetRole}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Certificates">
            {certificates.length === 0 ? (
              <p className="text-ink-500 text-sm">No certificates issued yet. Complete all skill gap tests to qualify.</p>
            ) : (
              <ul className="space-y-4">
                {certificates.map(c => (
                  <li key={c._id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-3">
                      <Award className="text-primary-500" />
                      <div>
                        <p className="font-bold text-ink-900">{c.targetRole}</p>
                        <p className="text-xs text-ink-500">ID: {c.certificateId}</p>
                      </div>
                    </div>
                    {c.pdfUrl && (
                      <a href={`http://localhost:5000${c.pdfUrl}`} target="_blank" rel="noreferrer" className="text-primary-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                        <FileText size={16} /> View PDF
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Employer Applications & Introductions">
            {introductions.length === 0 ? (
              <p className="text-ink-500 text-sm">No applications dispatched yet. Apply to jobs directly from Job Matches or enable Auto-Apply in Settings.</p>
            ) : (
              <ul className="space-y-3">
                {introductions.map(i => (
                  <li 
                    key={i._id} 
                    onClick={() => setSelectedIntro(i)}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                        <Mail size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-ink-900 truncate">
                          {i.jobId?.title || "Position Application"}
                        </p>
                        <p className="text-xs text-ink-500 truncate">
                          {i.jobId?.company || i.companyEmail} • {new Date(i.sentAt || i.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {i.jobMatchScore && (
                        <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                          {i.jobMatchScore}%
                        </span>
                      )}
                      <span className={`text-xs font-bold px-2 py-1 rounded ${i.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {i.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Dispatched Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={Boolean(selectedIntro)}
        onClose={() => setSelectedIntro(null)}
        application={selectedIntro}
      />
    </div>
  );
}
