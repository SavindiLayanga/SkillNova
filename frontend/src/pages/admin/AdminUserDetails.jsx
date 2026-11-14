import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, FileText, Target, Briefcase, BookOpen, Activity, Award, CheckCircle2, Download, ExternalLink, Send } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminCard from "../../components/admin/AdminCard.jsx";
import Button from "../../components/ui/Button.jsx";
import { fetchUserDetails, issueUserCertificate } from "../../services/adminUsersService.js";
import { usePreferences } from "../../context/PreferencesContext.jsx";
import { formatDate } from "../../utils/dateUtils.js";

export default function AdminUserDetails() {
  const { id } = useParams();
  const { preferences } = usePreferences();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Certificate Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certForm, setCertForm] = useState({ targetRole: "", readinessScore: 95, message: "" });
  const [isIssuing, setIsIssuing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const details = await fetchUserDetails(id);
        setData(details);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading user details...</div>;
  }

  if (error || !data?.user) {
    return (
      <div className="py-20 text-center">
        <p className="text-rose-500">{error || "User not found"}</p>
        <Link to="/admin/users" className="mt-4 text-primary-600 hover:underline">
          &larr; Back to users
        </Link>
      </div>
    );
  }

  const { user, cvAnalysis, skillTests, certificates } = data;

  const handleOpenCertModal = () => {
    const defaultRole = user?.targetRole || cvAnalysis?.targetRole || cvAnalysis?.primaryRole?.role || "Software Developer";
    const defaultScore = cvAnalysis?.careerReadinessScore || cvAnalysis?.matchPercentage || 98;
    setCertForm({
      targetRole: defaultRole,
      readinessScore: defaultScore,
      message: `Congratulations ${user.name}! Your Official SkillNova Certificate of Job Readiness for "${defaultRole}" has been approved and issued by the Admin Team. Keep up the great work!`
    });
    setIsCertModalOpen(true);
  };

  const handleIssueCertificateSubmit = async (e) => {
    e.preventDefault();
    setIsIssuing(true);
    try {
      const res = await issueUserCertificate(user._id, certForm);
      setToastMessage(res.message || "Certificate issued successfully!");
      setIsCertModalOpen(false);
      const refreshed = await fetchUserDetails(id);
      setData(refreshed);
      setTimeout(() => setToastMessage(""), 5000);
    } catch (err) {
      alert(err.message || "Failed to issue certificate");
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800 shadow-sm flex items-center justify-between animate-fade-in-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage("")} className="text-emerald-600 hover:text-emerald-900">&times;</button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link to="/admin/users" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <AdminPageHeader title="User Details" description={`Viewing profile for ${user.name}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <AdminCard className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-4xl font-bold text-primary-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500">{user.email}</p>
            <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            }`}>
              {user.isActive ? "Active" : "Disabled"}
            </span>
          </div>

          <div className="mt-8 space-y-4 border-t border-slate-100 pt-6 text-sm">
            <div>
              <p className="text-slate-500">Career Goal</p>
              <p className="font-medium text-slate-900">{user.careerGoal || "Not specified"}</p>
            </div>
            <div>
              <p className="text-slate-500">Target Role</p>
              <p className="font-medium text-slate-900">{user.targetRole || "Not specified"}</p>
            </div>
            <div>
              <p className="text-slate-500">Joined Date</p>
              <p className="font-medium text-slate-900">{formatDate(user.createdAt, preferences)}</p>
            </div>
          </div>
        </AdminCard>

        {/* CV & Skills Data */}
        <div className="space-y-6 lg:col-span-2">
          {/* Certificate Section */}
          {certificates && certificates.length > 0 ? (
            <AdminCard className="border-amber-200 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">Official SkillNova Certificate</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Issued
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Certificate ID: <span className="font-mono font-bold text-slate-700">{certificates[0].certificateId}</span> • Issued on {formatDate(certificates[0].issueDate, preferences)}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Certified Role: <strong className="text-slate-900">{certificates[0].targetRole}</strong> • Readiness: <strong className="text-emerald-700">{certificates[0].jobReadinessScore}%</strong>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a 
                    href={`http://localhost:5000${certificates[0].pdfUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                  >
                    <Download className="h-3.5 w-3.5 text-primary-600" /> Download PDF
                  </a>
                  <Link 
                    to={`/verify/${certificates[0].certificateId}`} 
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" /> Verify Online
                  </Link>
                  <Button size="sm" variant="secondary" onClick={handleOpenCertModal}>
                    Re-Issue / Update
                  </Button>
                </div>
              </div>
            </AdminCard>
          ) : (
            <AdminCard className="border-primary-100 bg-gradient-to-r from-primary-50/40 via-white to-primary-50/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Certificate of Job Readiness</h2>
                    <p className="text-xs text-slate-600 mt-1">
                      {cvAnalysis?.missingSkills?.length === 0 
                        ? "✨ All skill gaps are resolved! This candidate is eligible for official certification." 
                        : `Candidate has ${cvAnalysis?.missingSkills?.length || 0} skill gaps identified.`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target Role: <strong className="text-slate-800">{user.targetRole || cvAnalysis?.targetRole || "Software Developer"}</strong>
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleOpenCertModal}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-sm"
                >
                  <Award className="h-4 w-4 mr-1.5" /> Issue Certificate & Send Message
                </Button>
              </div>
            </AdminCard>
          )}
          {/* Extracted Skills & Gaps */}
          <AdminCard>
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-slate-900">CV Analysis & Skills</h2>
            </div>
            
            {!cvAnalysis ? (
              <p className="py-4 text-sm text-slate-500">No CV uploaded yet.</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Extracted Skills</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cvAnalysis.skills?.length > 0 ? (
                      cvAnalysis.skills.map((s, i) => (
                        <span key={i} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">None extracted</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Skill Gaps (Missing)</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cvAnalysis.missingSkills?.length > 0 ? (
                      cvAnalysis.missingSkills.map((s, i) => (
                        <span key={i} className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No significant gaps identified</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </AdminCard>

          {/* Recommendations */}
          <div className="grid gap-6 sm:grid-cols-2">
            <AdminCard>
              <div className="mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-slate-900">Recommended Jobs</h2>
              </div>
              {!cvAnalysis || !cvAnalysis.jobMatches || cvAnalysis.jobMatches.length === 0 ? (
                <p className="text-sm text-slate-500">No job matches available.</p>
              ) : (
                <ul className="space-y-3">
                  {cvAnalysis.jobMatches.slice(0, 3).map((job, i) => (
                    <li key={i} className="text-sm">
                      <p className="font-medium text-slate-900">{job.role}</p>
                      <p className="text-slate-500">{job.company} • {job.match}% match</p>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>

            <AdminCard>
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-slate-900">Learning Path</h2>
              </div>
              {!cvAnalysis || !cvAnalysis.learningPath || cvAnalysis.learningPath.length === 0 ? (
                <p className="text-sm text-slate-500">No learning path generated.</p>
              ) : (
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                  {cvAnalysis.learningPath.slice(0, 4).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </AdminCard>
          </div>

          {/* Progress Tracking */}
          <AdminCard>
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Skill Tests</h2>
            </div>
            {!skillTests || skillTests.length === 0 ? (
              <p className="text-sm text-slate-500">No tests taken yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-medium">Topic</th>
                      <th className="px-4 py-2 font-medium">Score</th>
                      <th className="px-4 py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {skillTests.map((test) => (
                      <tr key={test._id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{test.topic}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                            test.score >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {test.score}%
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatDate(test.createdAt, preferences)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </div>
      </div>

      {/* Issue Certificate Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-fade-in-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Issue Official Certificate</h3>
                  <p className="text-xs text-slate-500">Deliver certificate & notify {user.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCertModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleIssueCertificateSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Candidate Target Role
                </label>
                <input 
                  type="text" 
                  value={certForm.targetRole}
                  onChange={(e) => setCertForm({ ...certForm, targetRole: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g. Frontend Developer, Full-Stack Engineer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Job Readiness Score (%)
                </label>
                <input 
                  type="number" 
                  min="60" 
                  max="100"
                  value={certForm.readinessScore}
                  onChange={(e) => setCertForm({ ...certForm, readinessScore: Number(e.target.value) })}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Notification Message to Student
                </label>
                <textarea 
                  rows="3"
                  value={certForm.message}
                  onChange={(e) => setCertForm({ ...certForm, message: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 leading-relaxed"
                  placeholder="Personalized congratulatory message delivered to user's notifications & inbox..."
                />
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3 text-xs text-slate-600 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Issuing this certificate will generate an official PDF with QR verification, set the candidate to <strong>Job Ready</strong>, and send the certificate directly to the student&apos;s messages.
                </span>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsCertModalOpen(false)}
                  disabled={isIssuing}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isIssuing}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  {isIssuing ? "Generating & Issuing..." : "Confirm & Issue Certificate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
