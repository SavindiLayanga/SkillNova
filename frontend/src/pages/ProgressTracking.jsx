import { CalendarDays, CheckCircle2, TrendingUp, Target, BookOpen, Award } from "lucide-react";
import AnalysisEmptyState from "../components/ui/AnalysisEmptyState.jsx";
import AnalysisProcessingState from "../components/ui/AnalysisProcessingState.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import useCVAnalysis from "../hooks/useCVAnalysis.js";
import { useNavigate } from "react-router-dom";

export default function ProgressTracking() {
  const { analysis, hasAnalysis, status } = useCVAnalysis();
  const navigate = useNavigate();

  const missingSkills = analysis?.missingSkills || [];
  // Create simulated milestones based on missing skills
  const milestones = missingSkills.map((gap) => ({
    title: `Master ${typeof gap === "string" ? gap : gap.skill}`,
    status: (typeof gap !== "string" && gap.current > 0) ? "In Progress" : "Not Started",
    progress: typeof gap === "string" ? 0 : gap.current || 0
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        description="Monitor completed learning activities, weekly focus, and readiness for your target role."
        eyebrow="Progress Tracking"
        title="Stay on top of your learning roadmap"
      />

      {status === "noCV" ? <AnalysisEmptyState /> : null}
      {status === "uploading" || status === "analyzing" ? (
        <AnalysisProcessingState status={status} />
      ) : null}

      {hasAnalysis ? (
        <>
          {/* Key Metrics Dashboard */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-slide-up">
            <Card className="p-4 flex flex-col justify-center">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
                  <h3 className="text-sm font-bold text-ink-900 leading-tight">Career Readiness</h3>
               </div>
               <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-ink-900">78%</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mb-1">+5% this month</span>
               </div>
            </Card>
            <Card className="p-4 flex flex-col justify-center">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><Target className="h-5 w-5" /></div>
                  <h3 className="text-sm font-bold text-ink-900 leading-tight">Roadmap Steps</h3>
               </div>
               <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-ink-900">2<span className="text-lg text-ink-400">/5</span></span>
                  <span className="text-xs font-medium text-ink-500 mb-1">Steps completed</span>
               </div>
            </Card>
            <Card className="p-4 flex flex-col justify-center">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="h-5 w-5" /></div>
                  <h3 className="text-sm font-bold text-ink-900 leading-tight">Courses Done</h3>
               </div>
               <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-ink-900">3</span>
                  <span className="text-xs font-medium text-ink-500 mb-1">Courses completed</span>
               </div>
            </Card>
            <Card className="p-4 flex flex-col justify-center">
               <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-lg"><Award className="h-5 w-5" /></div>
                  <h3 className="text-sm font-bold text-ink-900 leading-tight">Test Progress</h3>
               </div>
               <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-ink-900">+10%</span>
                  <span className="text-xs font-medium text-ink-500 mb-1">Score improvement</span>
               </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_1fr] animate-fade-in-slide-up">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink-900">
                    Missing Skills Reduced
                  </h2>
                  <p className="mt-1 text-sm text-ink-500">
                    Track the skills you've acquired over time.
                  </p>
                </div>
                <span className="text-3xl font-bold text-primary-600">
                  2
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm font-semibold text-ink-700 mb-2">
                 <span>Initial Gaps: 6</span>
                 <span>Current Gaps: {missingSkills.length > 0 ? missingSkills.length : 4}</span>
              </div>
              <ProgressBar className="h-3" value={((6 - (missingSkills.length || 4)) / 6) * 100} />
              <p className="mt-4 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                 You have successfully acquired 2 skills in the last 30 days! Keep up the momentum.
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-ink-900">
                  Weekly study focus
                </h2>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                 <div className="flex items-center gap-3 p-3 rounded-lg border border-ink-100 bg-ink-50">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div className="flex-1">
                       <p className="text-sm font-bold text-ink-900">Finish React Router Module</p>
                       <p className="text-xs text-ink-500">Completed on Tuesday</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 rounded-lg border border-primary-200 bg-primary-50/50 shadow-sm">
                    <div className="h-5 w-5 rounded-full border-2 border-primary-400" />
                    <div className="flex-1">
                       <p className="text-sm font-bold text-ink-900">Take API Integration Test</p>
                       <p className="text-xs text-primary-600 font-medium">Due by Friday</p>
                    </div>
                 </div>
              </div>
            </Card>
          </section>

          {milestones.length > 0 && (
            <Card className="animate-fade-in-slide-up">
              <h2 className="text-lg font-bold text-ink-900">Active Learning Milestones</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {milestones.map((milestone) => (
                  <button
                    key={milestone.title}
                    onClick={() => navigate('/skill-tests', { state: { autoStartPath: true, targetSkill: milestone.skill } })}
                    className="group w-full rounded-lg border border-ink-100 p-4 text-left transition-all hover:border-primary-500 hover:bg-primary-50/10 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-ink-300 transition-colors group-hover:text-primary-500" />
                      <div className="flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="font-semibold text-ink-900 group-hover:text-primary-700">
                            {milestone.title}
                          </h3>
                          <span className="w-fit rounded-full bg-ink-50 px-3 py-1 text-xs font-bold text-ink-500 border border-ink-100">
                            {milestone.status}
                          </span>
                        </div>
                        <ProgressBar className="mt-4" value={milestone.progress} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}

