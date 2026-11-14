import { useState, useContext, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lock,
  Check,
  Trophy,
  PlayCircle,
  Award,
  ShieldCheck,
  Copy,
  Download,
  ExternalLink,
  Briefcase,
  Sparkles,
  Share2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AnalysisEmptyState from "../components/ui/AnalysisEmptyState.jsx";
import AnalysisProcessingState from "../components/ui/AnalysisProcessingState.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import useCVAnalysis from "../hooks/useCVAnalysis.js";
import { PracticeContext } from "../context/practiceContextValue.js";

export default function SkillGapAnalysis() {
  const navigate = useNavigate();
  const { analysis, hasAnalysis, status } = useCVAnalysis();
  const { skillDifficultyScores } = useContext(PracticeContext);

  const missingSkills = analysis?.missingSkills || [];
  
  // Extract courses from learning path if available
  const recommendedCourses = analysis?.learningPath?.flatMap(lp => 
    (lp.courses || []).map(course => ({ title: course, skill: lp.skill }))
  ) || [];

  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [copied, setCopied] = useState(false);

  const copyCertId = (text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeTargetRole = certificates[0]?.targetRole || analysis?.targetRole || "Software Developer";

  useEffect(() => {
    async function loadCertificates() {
      try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const res = await fetch("/api/job-readiness/certificates", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCertificates(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load certificates:", err);
      }
    }
    loadCertificates();
  }, []);

  useEffect(() => {
    async function fetchVideos() {
      if (!recommendedCourses || recommendedCourses.length === 0) return;
      
      setLoadingVideos(true);
      try {
        const coursesToSearch = recommendedCourses.slice(0, 3);
        const results = await Promise.all(
          coursesToSearch.map(async (course) => {
            try {
              const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(course.title + ' tutorial')}`);
              if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                  return { ...course, video: data[0] };
                }
              }
            } catch (e) {
              console.error("Youtube fetch error", e);
            }
            return course;
          })
        );
        setYoutubeVideos(results);
      } catch (err) {
        console.error("Failed to fetch youtube videos", err);
      } finally {
        setLoadingVideos(false);
      }
    }
    
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnalysis, analysis]);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        action={
          hasAnalysis ? (
            certificates.length > 0 ? (
              <Link to="/jobs">
                <Button icon={Briefcase}>Browse Industry Jobs</Button>
              </Link>
            ) : (
              <Link to="/learning-path">
                <Button icon={BookOpen}>Generate learning path</Button>
              </Link>
            )
          ) : null
        }
        description={`Skill gap analysis for the target role: ${activeTargetRole}.`}
        eyebrow="Skill Gap Analysis"
        title="Prioritize the skills that move your profile forward"
      />

      {status === "noCV" ? <AnalysisEmptyState /> : null}
      {status === "uploading" || status === "analyzing" ? (
        <AnalysisProcessingState status={status} />
      ) : null}

      {hasAnalysis && missingSkills.length > 0 ? (
        <>
          {/* Skill Gaps Section (Full Width, 3 Columns) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold text-ink-900">
                  Identified Gaps
                </h2>
              </div>
              <span className="text-sm font-medium text-ink-500">{missingSkills.length} skills to improve</span>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {missingSkills.map((gap, idx) => {
                const skillName = typeof gap === "string" ? gap : (gap.name || gap.skill);
                
                const maxScores = skillDifficultyScores?.[skillName] || {};
                
                const getDifficultyStats = (level) => {
                  const data = maxScores[level] || { scores: [] };
                  // Backwards compatibility if old cache stored a number
                  if (typeof data === "number") return { average: data, completed: 1, isPassed: false };
                  
                  const scores = Array.isArray(data.scores) ? data.scores : [];
                  const completed = scores.length;
                  const total = scores.reduce((sum, s) => sum + s, 0);
                  const average = completed > 0 ? Math.round(total / completed) : 0;
                  const isPassed = completed >= 10 && average >= 80;
                  return { average, completed, isPassed };
                };

                const begStats = getDifficultyStats("Beginner");
                const intStats = getDifficultyStats("Intermediate");
                const advStats = getDifficultyStats("Advanced");

                const passedBeginner = begStats.isPassed;
                const passedIntermediate = intStats.isPassed;
                const passedAdvanced = advStats.isPassed;
                const isMastered = passedBeginner && passedIntermediate && passedAdvanced;

                // Calculate total percentage only when Advanced has been attempted (has a score)
                const hasAdvanced = advStats.completed > 0;
                const current = hasAdvanced ? Math.round((begStats.average + intStats.average + advStats.average) / 3) : 0;
                
                const radius = 24;
                const circumference = radius * 2 * Math.PI;
                const offset = circumference - (current / 100) * circumference;

                return (
                  <Card 
                    key={idx}
                    className="group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1.5 pr-4">
                        <h3 className="font-bold text-ink-900 text-lg group-hover:text-primary-600 transition-colors">
                          {skillName}
                        </h3>
                        {gap.priority && (
                          <span className="inline-block self-start rounded bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700 uppercase tracking-wide border border-primary-100">
                            {gap.priority} Priority
                          </span>
                        )}
                      </div>
                      
                      {/* Circular Progress */}
                      <div className="relative flex items-center justify-center w-[54px] h-[54px] shrink-0">
                        <svg className="transform -rotate-90 w-full h-full">
                          <circle
                            className="text-ink-50"
                            strokeWidth="5"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="27"
                            cy="27"
                          />
                          <circle
                            className="text-primary-500 transition-all duration-1000 ease-in-out"
                            strokeWidth="5"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="27"
                            cy="27"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-ink-900">
                          <span className="text-xs font-bold">{current}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-end">
                      {(() => {
                        const renderLevelBtn = (level, isLocked, passed, stats) => (
                          <button
                            key={level}
                            disabled={isLocked}
                            onClick={() => !isLocked && navigate("/skill-tests", { 
                              state: { autoStartDirectly: true, skillName, difficulty: level } 
                            })}
                            className={`flex items-center justify-between w-full p-2.5 rounded-lg border text-sm font-medium transition-all ${
                              isLocked 
                                ? "bg-ink-50 border-ink-100 text-ink-300 cursor-not-allowed" 
                                : passed
                                  ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                  : "bg-white border-primary-200 text-primary-700 hover:border-primary-400 hover:bg-primary-50 hover:shadow-sm"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isLocked ? <Lock className="h-4 w-4" /> : passed ? <CheckCircle2 className="h-4 w-4" /> : <div className="w-4 h-4 rounded-full border-2 border-primary-400"></div>}
                              <span>{level} <span className="text-xs font-normal opacity-70 ml-1">({stats.completed}/10)</span></span>
                            </div>
                            {stats.completed > 0 && (
                              <span className={`text-xs ${passed ? "text-green-600" : "text-primary-600"}`}>
                                Avg: {stats.average}%
                              </span>
                            )}
                          </button>
                        );

                        return (
                          <div className="space-y-2 mt-4">
                            {renderLevelBtn("Beginner", false, passedBeginner, begStats)}
                            {renderLevelBtn("Intermediate", !passedBeginner, passedIntermediate, intStats)}
                            {renderLevelBtn("Advanced", !passedBeginner || !passedIntermediate, passedAdvanced, advStats)}
                            
                            {isMastered && (
                              <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg flex items-center justify-center gap-2 text-amber-800 font-bold text-sm animate-fade-in">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                Skill Mastered!
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Bottom Section: Recommended Tutorials */}
          <section className="mt-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <BookOpen className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-ink-900">Recommended Tutorials</h2>
              </div>
              
              {loadingVideos ? (
                <Card className="text-center py-10 flex flex-col items-center justify-center space-y-4 h-full border-dashed">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-ink-500">Finding the best tutorials on YouTube...</p>
                </Card>
              ) : youtubeVideos.length > 0 ? (
                <div className="space-y-4">
                  {youtubeVideos.map((course, idx) => (
                    <Card key={idx} className="hover:border-primary-200 transition-all shadow-sm hover:shadow-md overflow-hidden p-0 group border-ink-200">
                      {course.video && course.video.thumbnail ? (
                        <div className="relative w-full aspect-video bg-ink-100 overflow-hidden">
                           <img 
                             src={course.video.thumbnail.thumbnails?.[0]?.url || ''} 
                             alt={course.title}
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                           />
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <a 
                                href={`https://www.youtube.com/watch?v=${course.video.id}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg hover:scale-110 hover:bg-white"
                              >
                                 <PlayCircle className="w-7 h-7 text-red-600 ml-0.5" />
                              </a>
                           </div>
                           <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                             YouTube
                           </span>
                        </div>
                      ) : null}
                      <div className="p-4 flex flex-col gap-3">
                        <div>
                          <h3 className="font-bold text-ink-900 text-sm leading-tight line-clamp-2" title={course.video ? course.video.title : course.title}>
                            {course.video ? course.video.title : course.title}
                          </h3>
                          {course.video && course.video.channelTitle && (
                            <p className="text-[11px] font-semibold text-ink-500 mt-1 flex items-center gap-1">
                              {course.video.channelTitle}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                           <span className="inline-flex rounded bg-ink-50 px-2 py-0.5 text-[10px] font-bold text-ink-600 border border-ink-200 truncate max-w-[120px]" title={course.skill}>
                             {course.skill}
                           </span>
                           {course.video ? (
                             <a 
                               href={`https://www.youtube.com/watch?v=${course.video.id}`}
                               target="_blank" 
                               rel="noopener noreferrer"
                             >
                               <Button variant="primary" size="sm" className="px-3 py-1 h-auto text-[11px] font-bold rounded shadow-sm hover:shadow">
                                 Watch
                               </Button>
                             </a>
                           ) : (
                               <Button variant="secondary" size="sm" className="px-3 py-1 h-auto text-[11px] font-bold rounded">
                                 Search
                               </Button>
                           )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-10 h-full flex flex-col justify-center">
                  <p className="text-sm text-ink-500">No course recommendations available right now.</p>
                </Card>
              )}
            </div>
          </section>
        </>
      ) : hasAnalysis && missingSkills.length === 0 ? (
        certificates.length > 0 ? (
          <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300/80 bg-gradient-to-b from-[#FFFDF9] via-white to-[#FDFBF7] p-6 sm:p-10 shadow-2xl shadow-amber-500/10 transition-all animate-fade-in-slide-up">
            {/* Diploma Decorative Corner Brackets */}
            <div className="absolute top-3.5 left-3.5 w-7 h-7 border-t-2 border-l-2 border-amber-400/90 rounded-tl-md pointer-events-none" />
            <div className="absolute top-3.5 right-3.5 w-7 h-7 border-t-2 border-r-2 border-amber-400/90 rounded-tr-md pointer-events-none" />
            <div className="absolute bottom-3.5 left-3.5 w-7 h-7 border-b-2 border-l-2 border-amber-400/90 rounded-bl-md pointer-events-none" />
            <div className="absolute bottom-3.5 right-3.5 w-7 h-7 border-b-2 border-r-2 border-amber-400/90 rounded-br-md pointer-events-none" />

            {/* Subtle Watermark & Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035] pointer-events-none" />
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              {/* Royal Gold 3D Crest Emblem */}
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-white shadow-xl shadow-amber-500/30 ring-8 ring-amber-100/90">
                <Award className="h-10 w-10 text-white drop-shadow" />
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white shadow-sm">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Verified Pill */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-300 px-4 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Official Industry Credential • Issued by Admin</span>
              </div>

              {/* Title & Recipient */}
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif">
                Certificate of Job Readiness
              </h2>
              <p className="mt-2 text-xs uppercase tracking-widest text-slate-400 font-bold">
                This officially certifies that
              </p>
              <h3 className="mt-1 text-2xl sm:text-3xl font-black text-primary-700 capitalize tracking-tight">
                {certificates[0].name || analysis?.name || "Kavishka Prabashra"}
              </h3>
              <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                has successfully cleared all identified technical skill gaps, passed rigorous assessments, and demonstrated verified mastery for the role of:
              </p>

              {/* Qualified Target Role Banner */}
              <div className="mt-4 inline-block rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 px-6 sm:px-8 py-3 shadow-2xs">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide">
                  {certificates[0].targetRole}
                </span>
              </div>

              {/* 4-Metric Accreditation Grid */}
              <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
                {/* Certificate ID */}
                <div className="rounded-2xl bg-white/95 border border-amber-200/70 p-4 shadow-2xs flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Credential ID</p>
                  <p className="font-mono text-xs sm:text-sm font-black text-slate-900 my-1 truncate">
                    {certificates[0].certificateId}
                  </p>
                  <button
                    onClick={() => copyCertId(certificates[0].certificateId)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 hover:text-primary-700 transition"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied!" : "Copy ID"}</span>
                  </button>
                </div>

                {/* Readiness Score */}
                <div className="rounded-2xl bg-white/95 border border-amber-200/70 p-4 shadow-2xs flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Readiness Score</p>
                  <p className="text-2xl font-black text-emerald-600 my-0.5">
                    {certificates[0].jobReadinessScore}%
                  </p>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    Top Tier Qualified
                  </span>
                </div>

                {/* Issue Date */}
                <div className="rounded-2xl bg-white/95 border border-amber-200/70 p-4 shadow-2xs flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Issue Date</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 my-1">
                    {new Date(certificates[0].issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <span className="text-[10px] text-slate-400">Permanent Record</span>
                </div>

                {/* Verification Status */}
                <div className="rounded-2xl bg-white/95 border border-amber-200/70 p-4 shadow-2xs flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-600 my-1 flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Active & Verified</span>
                  </p>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    Publicly Verifiable
                  </span>
                </div>
              </div>

              {/* Verified Competencies / Skills Endorsement Badges */}
              {certificates[0].skillsCompleted && certificates[0].skillsCompleted.length > 0 && (
                <div className="mt-7 rounded-2xl bg-amber-50/60 border border-amber-200/80 p-4 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-2.5">
                    Verified Competencies & Endorsed Skills
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {certificates[0].skillsCompleted.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-amber-200/80 flex flex-wrap items-center justify-center gap-3.5">
                {certificates[0].pdfUrl && (
                  <a 
                    href={`http://localhost:5000${certificates[0].pdfUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 px-5 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    <Download className="h-4 w-4 text-amber-400" />
                    <span>Download Official PDF</span>
                  </a>
                )}
                <Link 
                  to={`/verify/${certificates[0].certificateId}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-5 py-3 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition-all active:scale-95"
                >
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                  <span>Verify Credential Online</span>
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 px-5 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <Briefcase className="h-4 w-4 text-white" />
                  <span>Explore Matching Jobs</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <Card className="text-center p-8 border border-primary-100 bg-gradient-to-br from-primary-50/30 to-white">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-ink-900 text-xl">No skill gaps found!</h3>
            <p className="text-ink-500 mt-2 max-w-md mx-auto text-sm leading-relaxed">
              Your profile perfectly matches your target role based on your CV and completed assessments.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-50 border border-primary-200 px-4 py-1.5 text-xs font-bold text-primary-800">
              <span>🎓 Eligible for Official Certification • Admin Verification in Review</span>
            </div>
          </Card>
        )
      ) : null}
    </div>
  );
}
