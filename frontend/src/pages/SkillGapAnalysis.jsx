import { useState, useContext, useEffect } from "react";
import { BookOpen, Target, TrendingUp, CheckCircle2, XCircle, ArrowRight, Lock, Check, Trophy, PlayCircle } from "lucide-react";
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
            <Link to="/learning-path">
              <Button icon={BookOpen}>Generate learning path</Button>
            </Link>
          ) : null
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

          {/* Bottom Section: Courses and Market Demand Grid */}
          <section className="mt-8 grid gap-6 xl:grid-cols-3">
            
            {/* Left Column: Recommended Courses */}
            <div className="xl:col-span-1 space-y-4">
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

            {/* Right Column: Market Demand */}
            <div className="xl:col-span-2 space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-ink-50 rounded-lg text-ink-700 border border-ink-100">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink-900">Market Demand Analysis</h2>
                    <p className="text-sm text-ink-500">Compare your skills with current industry demands.</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-ink-100 text-ink-500 uppercase tracking-wider text-xs">
                      <th className="pb-3 font-semibold px-4 w-1/4">Skill</th>
                      <th className="pb-3 font-semibold px-4 w-1/4">Your Status</th>
                      <th className="pb-3 font-semibold px-4 w-1/4">Market Demand</th>
                      <th className="pb-3 font-semibold px-4 w-1/4 text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {[
                      { skill: "React.js", status: "User has", demand: 88, priority: "High" },
                      { skill: "Node.js", status: "User has", demand: 85, priority: "High" },
                      { skill: "Docker", status: "Missing", demand: 81, priority: "High" },
                      { skill: "AWS", status: "Missing", demand: 79, priority: "Medium" },
                      { skill: "GraphQL", status: "Missing", demand: 72, priority: "Medium" },
                    ].map((item, idx) => (
                      <tr key={idx} className="hover:bg-ink-50/30 transition-colors">
                        <td className="py-4 px-4 font-bold text-ink-900">{item.skill}</td>
                        <td className="py-4 px-4">
                          {item.status === "User has" ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Has Skill
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md text-xs font-bold border border-rose-100">
                              <XCircle className="h-3.5 w-3.5" /> Missing
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                             <span className="font-bold text-ink-700 w-9 text-right">{item.demand}%</span>
                             <ProgressBar value={item.demand} className="w-32 h-2 opacity-80" />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`inline-flex px-2.5 py-1 rounded text-xs font-bold border ${
                            item.priority === 'High' ? 'text-orange-700 bg-orange-50 border-orange-100' : 'text-blue-700 bg-blue-50 border-blue-100'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            </div>
          </section>
        </>
      ) : hasAnalysis && missingSkills.length === 0 ? (
        <Card className="text-center p-8">
          <h3 className="font-bold text-ink-900 text-lg">No skill gaps found!</h3>
          <p className="text-ink-500 mt-2">Your profile perfectly matches your target role based on your CV.</p>
        </Card>
      ) : null}
    </div>
  );
}
