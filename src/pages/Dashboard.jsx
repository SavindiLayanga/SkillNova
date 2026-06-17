import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  FileUp,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import AnalysisEmptyState from "../components/ui/AnalysisEmptyState.jsx";
import AnalysisProcessingState from "../components/ui/AnalysisProcessingState.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import useAuth from "../hooks/useAuth.js";
import useCVAnalysis from "../hooks/useCVAnalysis.js";

const quickActions = [
  {
    title: "Upload new CV",
    description: "Refresh the analysis with your latest experience.",
    icon: FileUp,
    path: "/cv-upload",
    tone: "orange",
  },
  {
    title: "Review skill gaps",
    description: "See which skills need the most attention first.",
    icon: Target,
    path: "/skill-gap",
    tone: "rose",
  },
  {
    title: "Explore jobs",
    description: "Compare roles that match your current profile.",
    icon: BriefcaseBusiness,
    path: "/job-matches",
    tone: "teal",
  },
];

const toneStyles = {
  blue: "bg-blue-50/50 text-blue-600 border border-blue-100",
  emerald: "bg-emerald-50/50 text-emerald-600 border border-emerald-100",
  orange: "bg-primary-50/50 text-primary-600 border border-primary-100",
  purple: "bg-violet-50/50 text-violet-600 border border-violet-100",
  rose: "bg-rose-50/50 text-rose-600 border border-rose-100",
  teal: "bg-teal-50/50 text-teal-600 border border-teal-100",
};

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function SectionHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-ink-900 to-ink-600 bg-clip-text text-transparent">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-500">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, caption, tone = "orange" }) {
  return (
    <Card className="group flex min-h-36 flex-col justify-between p-5 hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-500 group-hover:text-ink-600 transition-colors">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900">{value}</p>
        </div>
        <span className={`rounded-xl p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${toneStyles[tone]}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-500">{caption}</p>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { analysis, hasAnalysis, status } = useCVAnalysis();
  
  const displayName = analysis?.name && analysis.name !== "User" && analysis.name !== "Candidate's full name" 
    ? analysis.name 
    : user?.name || "SkillNova User";
  const firstName = displayName.split(" ")[0];
  const targetRole = analysis?.targetRole && analysis.targetRole !== "Unknown Role" 
    ? analysis.targetRole 
    : user?.targetRole || "Unknown Role";
  
  const initials = getInitials(displayName) || "SN";
  const today = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date());

  const careerMatch = hasAnalysis ? analysis.skillMatchScore : 0;
  const missingSkillsCount = hasAnalysis ? analysis.missingSkills?.length || 0 : 0;

  const summaryCards = hasAnalysis
    ? [
        {
          label: "Overall CV Score",
          value: analysis.cvScore || 0,
          caption: "Based on content and structure.",
          icon: BarChart3,
          tone: "orange",
        },
        {
          label: "Missing Skills",
          value: missingSkillsCount,
          caption: "Priority gaps detected for your target role.",
          icon: Target,
          tone: "rose",
        },
        {
          label: "Skill Match Score",
          value: `${careerMatch}%`,
          caption: "Best current job match confidence.",
          icon: TrendingUp,
          tone: "teal",
        },
        {
          label: "Target Role",
          value: analysis.targetRole,
          caption: "Inferred from your CV.",
          icon: BriefcaseBusiness,
          tone: "blue",
        },
      ]
    : [];

  return (
    <div className="space-y-12 pb-10">
      <section className="space-y-6">
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary-600">
                Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-bold text-ink-900 sm:text-3xl">
                Good afternoon, {firstName}
              </h1>
              <p className="mt-2 text-sm leading-6 text-ink-500">
                Track your SkillNova career readiness for {targetRole}.
              </p>
            </div>

            <div className="grid gap-3 lg:min-w-[680px] lg:grid-cols-[minmax(220px,1fr)_auto_auto]">
              <label className="flex h-12 items-center gap-3 rounded-lg border border-ink-100 bg-ink-50 px-4">
                <Search className="h-4 w-4 shrink-0 text-ink-500" />
                <input
                  className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-500"
                  placeholder="Search skills, courses, jobs"
                  type="search"
                />
              </label>
              <div className="flex h-12 items-center gap-3 rounded-lg border border-ink-100 bg-white px-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-ink-500">{targetRole}</p>
                </div>
              </div>
              <div className="flex h-12 items-center gap-3 rounded-lg border border-ink-100 bg-white px-4">
                <CalendarDays className="h-4 w-4 text-primary-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                    Today
                  </p>
                  <p className="text-sm font-semibold text-ink-900">{today}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {hasAnalysis ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <SummaryCard key={card.label} {...card} />
            ))}
          </div>
        ) : null}
      </section>

      {status === "noCV" ? <AnalysisEmptyState /> : null}

      {status === "uploading" || status === "analyzing" ? (
        <AnalysisProcessingState status={status} />
      ) : null}

      {hasAnalysis ? (
        <>
          <section className="animate-fade-in-slide-up">
            <SectionHeader
              description="A quick overview of your career readiness based on your CV and skill analysis."
              title="Career Readiness Score"
            />
            <Card className="p-5 sm:p-6 grid gap-6 lg:grid-cols-2 items-center bg-gradient-to-br from-white to-primary-50/30">
              <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
                 <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90 drop-shadow-sm">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-ink-100/50" />
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351.858" strokeDashoffset={351.858 - (351.858 * 78) / 100} className="text-primary-500 transition-all duration-1000 ease-out" />
                    </svg>
                    <span className="absolute text-3xl font-extrabold text-ink-900">78%</span>
                 </div>
                 <h3 className="mt-4 text-xl font-bold text-ink-900 tracking-tight">Overall Score</h3>
                 <p className="mt-2 text-sm leading-relaxed text-ink-600 max-w-sm text-center lg:text-left">
                   Your profile is looking strong! Focus on bridging your technical skill gaps to boost your job match score and stand out to employers.
                 </p>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-ink-700">Technical Skills</span><span className="font-bold text-ink-900">82%</span></div>
                  <ProgressBar value={82} className="h-2 opacity-90" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-ink-700">Soft Skills</span><span className="font-bold text-ink-900">70%</span></div>
                  <ProgressBar value={70} className="h-2 opacity-90" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-ink-700">Industry Readiness</span><span className="font-bold text-ink-900">75%</span></div>
                  <ProgressBar value={75} className="h-2 opacity-90" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-ink-700">Job Match</span><span className="font-bold text-ink-900">80%</span></div>
                  <ProgressBar value={80} className="h-2 opacity-90" />
                </div>
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader
              description="Human-readable feedback generated from your CV."
              title="AI Insights"
            />
            <Card className="p-5 sm:p-6 bg-primary-50 border-primary-100">
              <div className="flex items-start gap-4">
                <Sparkles className="h-6 w-6 text-primary-600 mt-1 shrink-0" />
                <p className="text-sm leading-6 text-ink-700">
                  {analysis.aiInsights}
                </p>
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader
              description="Small focused tasks that move your profile forward without crowding the overview."
              title="Quick Actions"
            />
            <div className="grid gap-5 md:grid-cols-3">
              {quickActions.map(({ description, icon: Icon, path, title, tone }) => (
                <Link
                  className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white/70 p-6 shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-glass hover:bg-white"
                  key={title}
                  to={path}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${toneStyles[tone]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-bold text-ink-900 group-hover:text-primary-700 transition-colors">{title}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-ink-500">
                    {description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600">
                    Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              description="Categorized skills extracted from your CV."
              title="Extracted Skills"
            />
            <Card className="p-5 sm:p-6">
                <div className="flex flex-wrap gap-2">
                    {analysis.extracted?.skills?.map((skill, idx) => (
                      <span
                        className="rounded-full bg-ink-50 border border-ink-100 px-3 py-1 text-sm font-semibold text-ink-700"
                        key={idx}
                      >
                        {skill.name} <span className="text-xs font-normal text-ink-500">({skill.category})</span>
                      </span>
                    ))}
                </div>
            </Card>
          </section>

          <section>
            <SectionHeader
              description="Personalized learning roadmap to fill your skill gaps."
              title="Learning Recommendations"
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {analysis.learningPath?.map((path, idx) => (
                <Card className="p-5" key={idx}>
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-5 w-5 text-rose-500" />
                    <h3 className="font-bold text-ink-900">Missing: {path.skill}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {path.courses?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-ink-500 mb-2">Courses</p>
                        <ul className="list-disc pl-5 text-sm text-ink-700 space-y-1">
                          {path.courses.map((course, i) => <li key={i}>{course}</li>)}
                        </ul>
                      </div>
                    )}
                    {path.certifications?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-ink-500 mb-2">Certifications</p>
                        <ul className="list-disc pl-5 text-sm text-ink-700 space-y-1">
                          {path.certifications.map((cert, i) => <li key={i}>{cert}</li>)}
                        </ul>
                      </div>
                    )}
                    {path.projects?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase text-ink-500 mb-2">Projects</p>
                        <ul className="list-disc pl-5 text-sm text-ink-700 space-y-1">
                          {path.projects.map((proj, i) => <li key={i}>{proj}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              description="A short preview of opportunities that fit your analyzed CV."
              title="Career Recommendations"
            />
            <div className="grid gap-4 xl:grid-cols-3">
              {analysis.careerRecommendations?.map((job, idx) => (
                <Card className="flex flex-col justify-between p-5" key={idx}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-bold text-ink-900">{job.role}</h3>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 whitespace-nowrap">
                      {job.matchPercentage}% match
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
             <Card className="p-5 sm:p-6">
                <h3 className="text-lg font-bold text-ink-900 mb-4">Experience Summary</h3>
                <div className="space-y-4">
                  {analysis.extracted?.experience?.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-ink-100 pl-4 py-1">
                      <h4 className="font-semibold text-ink-900">{exp.role}</h4>
                      <p className="text-xs font-semibold text-ink-500 mt-1">{exp.place} | {exp.period}</p>
                      <p className="text-sm text-ink-700 mt-2">{exp.detail}</p>
                    </div>
                  ))}
                  {!analysis.extracted?.experience?.length && (
                    <p className="text-sm text-ink-500">No experience extracted.</p>
                  )}
                </div>
             </Card>
             <Card className="p-5 sm:p-6">
                <h3 className="text-lg font-bold text-ink-900 mb-4">Education Summary</h3>
                <div className="space-y-4">
                  {analysis.extracted?.education?.map((edu, idx) => (
                    <div key={idx} className="border-l-2 border-ink-100 pl-4 py-1">
                      <h4 className="font-semibold text-ink-900">{edu.title}</h4>
                      <p className="text-xs font-semibold text-ink-500 mt-1">{edu.provider}</p>
                      <p className="text-sm text-ink-700 mt-2">{edu.detail}</p>
                    </div>
                  ))}
                  {!analysis.extracted?.education?.length && (
                    <p className="text-sm text-ink-500">No education extracted.</p>
                  )}
                </div>
             </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}
