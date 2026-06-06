import { CalendarDays, CheckCircle2 } from "lucide-react";
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
  const skillScore = analysis?.skillMatchScore || 0;
  
  // Use missing skills to generate progress trackers (starting at current levels)
  const learningProgress = missingSkills.map(gap => ({
    label: typeof gap === "string" ? gap : gap.skill,
    value: typeof gap === "string" ? 0 : gap.current || 0
  }));

  // Create simulated milestones based on missing skills
  const milestones = missingSkills.map((gap, idx) => ({
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
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink-900">
                Overall readiness
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Based on CV, skills, and course progress.
              </p>
            </div>
            <span className="text-3xl font-bold text-primary-600">
              {skillScore}%
            </span>
          </div>
          <ProgressBar className="mt-6 h-3" value={skillScore} />
          
          {learningProgress.length > 0 ? (
            <div className="mt-6 space-y-4">
              {learningProgress.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold text-ink-700">
                      {item.label}
                    </span>
                    <span className="text-ink-500">{item.value}%</span>
                  </div>
                  <ProgressBar value={item.value} />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-ink-500">You have no missing skills to track!</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-ink-900">
              Weekly study focus
            </h2>
          </div>
          <div className="mt-6 flex h-56 items-center justify-center border-2 border-dashed border-ink-100 rounded-lg">
            <p className="text-sm text-ink-500 px-4 text-center">
              Study focus tracking will populate as you begin completing courses and assignments.
            </p>
          </div>
        </Card>
      </section>

      {milestones.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-ink-900">Roadmap milestones</h2>
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
                      <span className="w-fit rounded-full bg-ink-50 px-3 py-1 text-xs font-bold text-ink-500">
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
