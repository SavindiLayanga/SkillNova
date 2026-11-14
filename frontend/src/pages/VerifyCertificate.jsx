import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, ShieldCheck, Download, Award, ArrowLeft } from "lucide-react";

export default function VerifyCertificate() {
  const { id } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    fetch(`${apiUrl}/public/verify-certificate/${id}`)
      .then(res => res.json())
      .then(data => setVerification(data))
      .catch(() => setVerification({ valid: false, message: "Network Error" }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center text-ink-500">Verifying...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className={`p-6 text-center ${verification?.valid ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          {verification?.valid ? (
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 text-rose-500 mb-4" />
          )}
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {verification?.valid ? "Valid Certificate" : "Invalid Certificate"}
          </h1>
          <p className="text-sm text-slate-500">
            {verification?.valid 
              ? "This certificate has been verified by SkillNova." 
              : (verification?.message || "This certificate ID could not be found.")}
          </p>
        </div>

        {verification?.valid && (
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Candidate Name</p>
              <p className="font-semibold text-slate-800">{verification.candidateName}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Role</p>
              <p className="font-semibold text-slate-800">{verification.targetRole}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Job Readiness Score</p>
              <p className="font-semibold text-slate-800">{verification.readinessScore}%</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Date</p>
              <p className="font-semibold text-slate-800">{new Date(verification.issueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Skills</p>
              <div className="flex flex-wrap gap-2">
                {verification.verifiedSkills.map((skill, idx) => (
                  <span key={idx} className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {verification.pdfUrl && (
              <div className="pt-2">
                <a 
                  href={`http://localhost:5000${verification.pdfUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition"
                >
                  <Download className="h-4 w-4" /> Download Official PDF Certificate
                </a>
              </div>
            )}
          </div>
        )}
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-bold">
          <div className="flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck size={16} />
            Verified by SkillNova
          </div>
          <Link to="/" className="text-primary-600 hover:underline">
            SkillNova Home &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
