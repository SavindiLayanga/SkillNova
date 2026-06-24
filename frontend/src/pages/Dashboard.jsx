import { useEffect, useState } from "react";
import Loader from "../components/ui/Loader.jsx";
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
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import AnalysisEmptyState from "../components/ui/AnalysisEmptyState.jsx";
import Card from "../components/ui/Card.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import useAuth from "../hooks/useAuth.js";
import {
  fetchDashboardSummary,
  fetchLatestAnalysis,
  fetchSkillGaps,
  fetchLearningPath,
  fetchRecentTests
} from "../services/dashboardService.js";

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
  const { user, getToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [summary, setSummary] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [skillGaps, setSkillGaps] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [recentTests, setRecentTests] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }

        const [sumRes, analysisRes, gapsRes, pathRes, testsRes] = await Promise.all([
          fetchDashboardSummary(token).catch(() => ({})),
          fetchLatestAnalysis(token).catch(() => ({})),
          fetchSkillGaps(token).catch(() => ({ missingSkills: [] })),
          fetchLearningPath(token).catch(() => ({})),
          fetchRecentTests(token).catch(() => [])
        ]);

        if (isMounted) {
          setSummary(sumRes);
          setLatestAnalysis(analysisRes);
          setSkillGaps(gapsRes);
          setLearningPath(pathRes);
          setRecentTests(testsRes);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load dashboard data. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => { isMounted = false; };
  }, [getToken]);

  const hasAnalysis = latestAnalysis && Object.keys(latestAnalysis).length > 0;
  
  const displayName = latestAnalysis?.name && 
    !latestAnalysis.name.includes("Mock") && 
    latestAnalysis.name !== "User" && 
    latestAnalysis.name !== "Candidate's full name" 
    ? latestAnalysis.name 
    : user?.name || "SkillNova User";
  const firstName = displayName.split(" ")[0];
  const targetRole = latestAnalysis?.targetRole && latestAnalysis.targetRole !== "Unknown Role" 
    ? latestAnalysis.targetRole 
    : user?.targetRole || "Unknown Role";
  
  const initials = getInitials(displayName) || "SN";
  const today = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date());

  const summaryCards = [
    {
      label: "Technical Skills",
      value: summary?.totalTechnicalSkills || 0,
      caption: "Hard skills identified from CV.",
      icon: BarChart3,
      tone: "blue",
    },
    {
      label: "Soft Skills",
      value: summary?.totalSoftSkills || 0,
      caption: "Interpersonal skills detected.",
      icon: Target,
      tone: "teal",
    },
    {
      label: "Missing Skills",
      value: summary?.skillGapCount || 0,
      caption: "Gaps detected for target role.",
      icon: AlertCircle,
      tone: "rose",
    },
    {
      label: "Career Match",
      value: `${summary?.careerMatch || 0}%`,
      caption: "Best job match confidence.",
      icon: TrendingUp,
      tone: "orange",
    },
  ];

  if (loading) {
    return <Loader text="Loading your dashboard data..." secondaryText="This may take a few seconds." />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <div>
          <h2 className="text-lg font-bold text-ink-900">Oops! Something went wrong.</h2>
          <p className="mt-1 text-sm text-ink-600">{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
          Try Again
        </button>
      </div>
    );
  }

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

      {!hasAnalysis ? <AnalysisEmptyState /> : null}

      {hasAnalysis ? (
        <>
          {/* LATEST ANALYSIS SECTION */}
          <section className="animate-fade-in-slide-up">
            <SectionHeader
              description="A quick overview of your career readiness based on your latest analysis."
              title="Career Readiness Score"
            />
            <Card className="p-5 sm:p-6 grid gap-6 lg:grid-cols-2 items-center bg-gradient-to-br from-white to-primary-50/30">
              <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
                 <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90 drop-shadow-sm">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-ink-100/50" />
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351.858" strokeDashoffset={351.858 - (351.858 * (latestAnalysis.cvScore || latestAnalysis.skillMatchScore || 0)) / 100} className="text-primary-500 transition-all duration-1000 ease-out" />
                    </svg>
                    <span className="absolute text-3xl font-extrabold text-ink-900">{latestAnalysis.cvScore || latestAnalysis.skillMatchScore || 0}%</span>
                 </div>
                 <h3 className="mt-4 text-xl font-bold text-ink-900 tracking-tight">Overall Score</h3>
                 <p className="mt-2 text-sm leading-relaxed text-ink-600 max-w-sm text-center lg:text-left">
                   Your profile is looking strong! Focus on bridging your technical skill gaps to boost your job match score and stand out to employers.
                 </p>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-ink-700">Total Skills Extracted</span><span className="font-bold text-ink-900">{summary?.totalSkills || 0}</span></div>
                  <ProgressBar value={summary?.totalSkills ? 100 : 0} className="h-2 opacity-90" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-ink-700">Technical Skills</span><span className="font-bold text-ink-900">{summary?.totalTechnicalSkills || 0}</span></div>
                  <ProgressBar value={summary?.totalSkills ? ((summary.totalTechnicalSkills || 0) / summary.totalSkills) * 100 : 0} className="h-2 opacity-90" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-ink-700">Soft Skills</span><span className="font-bold text-ink-900">{summary?.totalSoftSkills || 0}</span></div>
                  <ProgressBar value={summary?.totalSkills ? ((summary.totalSoftSkills || 0) / summary.totalSkills) * 100 : 0} className="h-2 opacity-90" />
                </div>
              </div>
            </Card>
          </section>

          {summary?.aiInsights && (
            <section>
              <SectionHeader
                description="Human-readable feedback generated from your profile."
                title="AI Insights"
              />
              <Card className="p-5 sm:p-6 bg-primary-50 border-primary-100">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-primary-600 mt-1 shrink-0" />
                  <p className="text-sm leading-6 text-ink-700">
                    {summary.aiInsights}
                  </p>
                </div>
              </Card>
            </section>
          )}

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

          {/* SKILL GAPS SECTION */}
          <section>
            <SectionHeader
              description="Skills you need to acquire to match your target role."
              title="Skill Gaps"
            />
            {skillGaps?.missingSkills?.length > 0 ? (
              <Card className="p-5 sm:p-6">
                  <div className="flex flex-wrap gap-2">
                      {skillGaps.missingSkills.map((skill, idx) => (
                        <span
                          className="rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-sm font-semibold text-rose-700 flex items-center gap-1"
                          key={idx}
                        >
                          <Target className="h-3 w-3" />
                          {skill.name || skill}
                        </span>
                      ))}
                  </div>
              </Card>
            ) : (
              <Card className="p-8 text-center border-dashed border-2">
                <Target className="h-10 w-10 text-ink-300 mx-auto mb-3" />
                <p className="text-ink-600 font-medium">No skill gaps detected yet.</p>
                <p className="text-sm text-ink-500 mt-1">Complete an analysis to see what you're missing.</p>
              </Card>
            )}
          </section>

          {/* LEARNING PATH SECTION */}
          <section>
            <SectionHeader
              description="Personalized learning roadmap to fill your skill gaps."
              title="Learning Path"
            />
            {learningPath?.modules?.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {learningPath.modules.map((module, idx) => (
                  <Card className="p-5 flex flex-col justify-between" key={idx}>
                    <div>
                      <div className="flex items-start justify-between mb-2">
                         <h3 className="font-bold text-ink-900 leading-tight">{module.title}</h3>
                         {module.isCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                      </div>
                      <span className="inline-block bg-ink-50 text-ink-600 text-xs font-semibold px-2 py-1 rounded-md mb-3">
                        {module.duration}
                      </span>
                      <p className="text-sm text-ink-600 mb-4">{module.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed border-2">
                <BookOpen className="h-10 w-10 text-ink-300 mx-auto mb-3" />
                <p className="text-ink-600 font-medium">No active learning path.</p>
                <p className="text-sm text-ink-500 mt-1">Generate a learning path from your skill gaps to get started.</p>
              </Card>
            )}
          </section>

          {/* RECENT TESTS SECTION */}
          <section>
            <SectionHeader
              description="Your latest skill assessment results."
              title="Recent Tests"
            />
            {recentTests && recentTests.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                 {recentTests.map((test) => (
                    <Card key={test._id} className="p-5 border-l-4 border-l-blue-500">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-ink-900">{test.skillName}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${test.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {test.isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      {test.isCompleted && (
                        <p className="text-sm text-ink-600 mt-2">Score: <span className="font-bold text-ink-900">{test.score}%</span></p>
                      )}
                    </Card>
                 ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed border-2">
                <AlertCircle className="h-10 w-10 text-ink-300 mx-auto mb-3" />
                <p className="text-ink-600 font-medium">No recent tests taken.</p>
                <p className="text-sm text-ink-500 mt-1">Take a skill test to evaluate your proficiency.</p>
              </Card>
            )}
          </section>

          {/* CAREER RECOMMENDATIONS */}
          {latestAnalysis.careerRecommendations?.length > 0 && (
            <section>
              <SectionHeader
                description="A short preview of opportunities that fit your analyzed profile."
                title="Career Recommendations"
              />
              <div className="grid gap-4 xl:grid-cols-3">
                {latestAnalysis.careerRecommendations.map((job, idx) => (
                  <Card className="flex flex-col justify-between p-5" key={idx}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="font-bold text-ink-900">{job.role || job}</h3>
                      {job.matchPercentage && (
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 whitespace-nowrap">
                          {job.matchPercentage}% match
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

        </>
      ) : null}
    </div>
  );
}
