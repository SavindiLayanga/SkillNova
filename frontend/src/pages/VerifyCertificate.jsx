import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, XCircle, ShieldCheck } from "lucide-react";

export default function VerifyCertificate() {
  const { id } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/public/verify-certificate/${id}`)
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
          </div>
        )}
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck size={16} />
          Verified by SkillNova
        </div>
      </div>
    </div>
  );
}
