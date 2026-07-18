import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, FileText, Target, Briefcase, BookOpen, Activity } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AdminCard from "../../components/admin/AdminCard.jsx";
import { fetchUserDetails } from "../../services/adminUsersService.js";
import { usePreferences } from "../../context/PreferencesContext.jsx";
import { formatDate } from "../../utils/dateUtils.js";

export default function AdminUserDetails() {
  const { id } = useParams();
  const { preferences } = usePreferences();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const { user, cvAnalysis, skillTests } = data;

  return (
    <div className="space-y-6">
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
    </div>
  );
}
