import { BookOpen, Target } from "lucide-react";
import AnalysisEmptyState from "../components/ui/AnalysisEmptyState.jsx";
import AnalysisProcessingState from "../components/ui/AnalysisProcessingState.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import useCVAnalysis from "../hooks/useCVAnalysis.js";

export default function SkillGapAnalysis() {
  const { analysis, hasAnalysis, status } = useCVAnalysis();

  const missingSkills = analysis?.missingSkills || [];
  
  // Extract courses from learning path if available
  const recommendedCourses = analysis?.learningPath?.flatMap(lp => 
    (lp.courses || []).map(course => ({ title: course, skill: lp.skill }))
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          hasAnalysis ? <Button icon={BookOpen}>Generate learning path</Button> : null
        }
        description={`Skill gap analysis for the target role: ${analysis?.targetRole || "your target role"}.`}
        eyebrow="Skill Gap Analysis"
        title="Prioritize the skills that move your profile forward"
      />

      {status === "noCV" ? <AnalysisEmptyState /> : null}
      {status === "uploading" || status === "analyzing" ? (
        <AnalysisProcessingState status={status} />
      ) : null}

      {hasAnalysis && missingSkills.length > 0 ? (
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-ink-900">
              Gap breakdown
            </h2>
          </div>
          <div className="mt-6 space-y-5">
            {missingSkills.map((gap, idx) => {
              const skillName = typeof gap === "string" ? gap : gap.skill;
              const current = gap.current || 0;
              const required = gap.required || 100;
              
              return (
              <div
                className="rounded-lg border border-ink-100 p-4"
                key={idx}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-ink-900">{skillName}</h3>
                    {gap.recommendation && (
                      <p className="mt-1 text-sm text-ink-500">
                        {gap.recommendation}
                      </p>
                    )}
                  </div>
                  {gap.priority && (
                    <span className="w-fit rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                      {gap.priority}
                    </span>
                  )}
                </div>
                {gap.required && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="mb-2 flex justify-between text-xs font-semibold text-ink-500">
                        <span>Current</span>
                        <span>{current}%</span>
                      </div>
                      <ProgressBar value={current} />
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-xs font-semibold text-ink-500">
                        <span>Required</span>
                        <span>{required}%</span>
                      </div>
                      <ProgressBar value={required} />
                    </div>
                  </div>
                )}
              </div>
            )})}
          </div>
        </Card>

        {recommendedCourses.length > 0 && (
          <Card>
            <h2 className="text-lg font-bold text-ink-900">Course matches</h2>
            <p className="mt-1 text-sm text-ink-500">
              Suggested courses to help you bridge your skill gaps.
            </p>
            <div className="mt-6 space-y-4">
              {recommendedCourses.map((course, idx) => (
                <div className="rounded-lg bg-ink-50 p-4" key={idx}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-ink-900">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm text-ink-500">
                        Recommended for: {course.skill}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary-700">
                      Top Pick
                    </span>
                  </div>
                  <Button className="mt-4 w-full" variant="secondary">
                    View Course
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>
      ) : hasAnalysis && missingSkills.length === 0 ? (
        <Card className="text-center p-8">
          <h3 className="font-bold text-ink-900 text-lg">No skill gaps found!</h3>
          <p className="text-ink-500 mt-2">Your profile perfectly matches your target role based on your CV.</p>
        </Card>
      ) : null}
    </div>
  );
}
