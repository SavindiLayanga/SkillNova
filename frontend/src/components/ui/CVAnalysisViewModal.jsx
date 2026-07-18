import { X, CheckCircle2, Target, Briefcase, Award, GraduationCap, Sparkles } from "lucide-react";
import Button from "./Button.jsx";
import { usePreferences } from "../../context/PreferencesContext.jsx";
import { formatDateTime } from "../../utils/dateUtils.js";

export default function CVAnalysisViewModal({ analysis, onClose }) {
  const { preferences } = usePreferences();
  if (!analysis) return null;

  const renderList = (items, fallback = "None") => {
    if (!items || items.length === 0) return <p className="text-sm text-ink-500">{fallback}</p>;
    return (
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-ink-700">
            {typeof item === "string" ? item : item.name || item.title || item.role || JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  };

  const renderProjects = (projects) => {
    if (!projects || projects.length === 0) return <p className="text-sm text-ink-500">None</p>;
    return (
      <div className="space-y-4">
        {projects.map((proj, idx) => (
          <div key={idx} className="bg-ink-50 p-3 rounded-lg">
            <h4 className="font-bold text-ink-900">{proj.name || "Unnamed Project"}</h4>
            <p className="text-sm text-ink-600 mt-1">{proj.description || "No description provided."}</p>
            {proj.technologies && proj.technologies.length > 0 && (
              <p className="text-xs font-semibold text-primary-600 mt-2">
                Tech: {proj.technologies.join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderExperience = (exp) => {
    if (!exp || exp.length === 0) return <p className="text-sm text-ink-500">None</p>;
    return (
      <div className="space-y-4">
        {exp.map((job, idx) => (
          <div key={idx} className="border-l-2 border-primary-200 pl-4 py-1">
            <h4 className="font-bold text-ink-900">{job.role || job.title || "Unknown Role"}</h4>
            <p className="text-sm font-medium text-ink-600">{job.company || "Unknown Company"} | {job.duration || job.years || ""}</p>
            {job.description && <p className="text-sm text-ink-500 mt-1">{job.description}</p>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-ink-100 bg-ink-50">
          <div>
            <h2 className="text-xl font-bold text-ink-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-600" />
              Analysis: {analysis.primaryRole?.role || analysis.targetRole || "Unknown Role"}
            </h2>
            <div className="flex gap-4 mt-2">
              {analysis.matchPercentage !== undefined && (
                <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">Match: {analysis.matchPercentage}%</span>
              )}
              {analysis.careerReadinessScore !== undefined && (
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Readiness: {analysis.careerReadinessScore}%</span>
              )}
            </div>
            <p className="text-sm text-ink-500 mt-2">
              {formatDateTime(analysis.createdAt || Date.now(), preferences)}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-ink-400 hover:text-ink-600 hover:bg-ink-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          
          {analysis.topRoles && analysis.topRoles.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-500" /> Top Role Matches
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {analysis.topRoles.map((roleObj, idx) => (
                  <div key={idx} className="bg-ink-50 p-3 rounded-lg border border-ink-100">
                    <h4 className="font-bold text-ink-900">{roleObj.role}</h4>
                    <p className="text-xs font-semibold text-primary-600 mb-1">Confidence: {roleObj.confidence}%</p>
                    <p className="text-xs text-ink-600">{roleObj.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Strong Skills
                </h3>
              </div>
              {renderList(analysis.strongSkills?.length ? analysis.strongSkills : analysis.skills)}
            </div>
            
            <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-rose-900 flex items-center gap-2">
                  <Target className="h-4 w-4" /> Weak / Missing Skills
                </h3>
              </div>
              {renderList(analysis.weakSkills?.length ? analysis.weakSkills : analysis.missingSkills)}
            </div>
          </div>

          <div className="space-y-8">
            {analysis.aiInsights && (
              <section>
                <h3 className="text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-500" /> AI Insights
                </h3>
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 text-sm leading-relaxed text-ink-700">
                  {analysis.aiInsights}
                </div>
              </section>
            )}

            <div className="grid sm:grid-cols-2 gap-8">
              <section>
                <h3 className="text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-ink-500" /> Career Recommendations
                </h3>
                {renderList(analysis.careerRecommendations)}
              </section>

              <section>
                <h3 className="text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-ink-500" /> Learning Path
                </h3>
                {renderList(analysis.learningPath?.modules || analysis.learningPath)}
              </section>
            </div>

            <hr className="border-ink-100" />

            <section>
              <h3 className="text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-ink-500" /> Experience
              </h3>
              {renderExperience(analysis.experience)}
            </section>

            <section>
              <h3 className="text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-ink-500" /> Projects
              </h3>
              {renderProjects(analysis.projects)}
            </section>

            <section>
              <h3 className="text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-ink-500" /> Certifications
              </h3>
              {renderList(analysis.certifications)}
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-ink-100 bg-ink-50 flex justify-end">
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
      </div>
    </div>
  );
}
