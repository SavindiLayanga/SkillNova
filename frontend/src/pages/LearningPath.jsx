import { BookOpen, CheckCircle2, Sparkles, AlertCircle, ArrowRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import Loader from "../components/ui/Loader.jsx";
import useCVAnalysis from "../hooks/useCVAnalysis.js";
import { generateCustomLearningPath } from "../services/aiService.js";
import { userMatchesService } from "../services/userMatchesService.js";
import useAuth from "../hooks/useAuth.js";

export default function LearningPath() {
  const { analysis, hasAnalysis, status } = useCVAnalysis();
  const { getToken } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPath, setCustomPath] = useState(null);
  const [error, setError] = useState(null);
  
  const [realCourses, setRealCourses] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    if (hasAnalysis && status === "analyzed") {
      setLoadingVideos(true);
      getToken().then(token => {
        if (!token) return;
        return userMatchesService.getCourseMatches(token);
      })
      .then(async (courses) => {
        if (!courses || courses.length === 0) {
          if (isMounted) {
            setRealCourses([]);
            setLoadingVideos(false);
          }
          return;
        }

        const coursesWithVideos = await Promise.all(
          courses.slice(0, 4).map(async (course) => {
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
        
        if (isMounted) {
          setRealCourses(coursesWithVideos);
          setLoadingVideos(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Failed to load course matches", err);
          setLoadingVideos(false);
        }
      });
    }
    return () => { isMounted = false; };
  }, [hasAnalysis, status, getToken]);

  const missingSkills = hasAnalysis ? (analysis.missingSkills || []) : [];
  const targetRole = hasAnalysis ? (analysis.targetRole || "your target role") : "";

  async function handleGeneratePath() {
    if (missingSkills.length === 0) {
      setError("No missing skills identified to build a path around.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedPath = await generateCustomLearningPath(targetRole, missingSkills);
      setCustomPath(generatedPath);
    } catch (err) {
      setError(err.message || "Failed to generate learning path.");
    } finally {
      setIsGenerating(false);
    }
  }

  // If the user hasn't uploaded a CV yet
  if (!hasAnalysis) {
    return (
      <div className="space-y-6">
        <PageHeader
          description="Follow a structured learning roadmap based on your career goal and CV analysis."
          eyebrow="Learning Path"
          title="Your recommended learning path"
        />
        <Card className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-ink-900 mb-2">No Profile Data Found</h2>
          <p className="text-ink-500 max-w-md mb-8">
            To generate a personalized learning roadmap, SkillNova needs to analyze your current skills against your target role.
          </p>
          <Link to="/cv-upload">
            <Button variant="primary">
              Go to Profile Setup <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-slide-up">
      <PageHeader
        description={`A dynamic, AI-generated roadmap designed specifically to help you become a ${targetRole}.`}
        eyebrow="Learning Path"
        title="Your personalized roadmap"
      />

      {/* Recommended Real Courses */}
      {(realCourses.length > 0 || loadingVideos) && (
        <div className="mb-8 border-b border-ink-100 pb-8">
          <h2 className="text-xl font-bold text-ink-900 mb-6">Recommended Tutorials</h2>
          {loadingVideos ? (
             <Card className="text-center py-10 flex flex-col items-center justify-center space-y-4 h-full border-dashed">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-ink-500">Finding the best tutorials on YouTube...</p>
             </Card>
          ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {realCourses.map((course, idx) => (
              <Card key={course.id || idx} className="flex flex-col gap-4 p-0 overflow-hidden hover:border-primary-200 transition-all shadow-sm group border-ink-200">
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
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-red-600 ml-0.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                        </a>
                     </div>
                     <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                       YouTube
                     </span>
                  </div>
                ) : null}
                <div className="p-5 pt-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-ink-900 text-base" title={course.video ? course.video.title : course.title}>{course.video ? course.video.title : course.title}</h3>
                    <p className="text-sm text-ink-500 mt-1">{course.video && course.video.channelTitle ? course.video.channelTitle : course.provider} • {course.difficulty}</p>
                    
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {course.skills?.slice(0,3).map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  {course.video && (
                     <div className="mt-4">
                       <a 
                         href={`https://www.youtube.com/watch?v=${course.video.id}`}
                         target="_blank" 
                         rel="noopener noreferrer"
                       >
                         <Button variant="primary" size="sm" className="w-full text-xs font-bold rounded shadow-sm hover:shadow">
                           Watch Video
                         </Button>
                       </a>
                     </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          )}
        </div>
      )}

      {/* AI Career Roadmap */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-ink-900 mb-6">AI Career Roadmap</h2>
        <div className="relative border-l-2 border-ink-100 ml-4 space-y-8 pb-4">
          {[
            {
              title: "Review Current Skills",
              description: "You already have a strong foundation based on your CV. Let's build on this.",
              resource: "Your CV Analysis",
              time: "Completed",
              status: "completed"
            },
            {
              title: "Learn Missing Skills",
              description: `Focus on mastering ${missingSkills.length > 0 ? missingSkills.slice(0, 3).join(", ") : "the essential technical skills"}.`,
              resource: "SkillNova Recommended Modules",
              time: "2 Weeks",
              status: "current"
            },
            {
              title: "Complete Recommended Courses",
              description: "Take specialized courses to solidify your understanding of advanced concepts.",
              resource: "Advanced Patterns Course",
              time: "3 Weeks",
              status: "upcoming"
            },
            {
              title: "Build Portfolio Project",
              description: "Apply your knowledge by building a real-world application to showcase your skills.",
              resource: "Project: Interactive Dashboard",
              time: "4 Weeks",
              status: "upcoming"
            },
            {
              title: "Apply for Roles",
              description: `Start applying for ${targetRole} positions with your updated profile.`,
              resource: "SkillNova Job Matches",
              time: "Ongoing",
              status: "upcoming"
            }
          ].map((step, idx) => (
            <div key={idx} className="relative pl-8 animate-fade-in-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
              {step.status === "completed" ? (
                <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-white flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              ) : step.status === "current" ? (
                <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-primary-500 ring-4 ring-white flex items-center justify-center animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              ) : (
                <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-ink-200 ring-4 ring-white" />
              )}
              
              <Card className={`p-5 ${step.status === 'current' ? 'border-primary-200 ring-1 ring-primary-100 bg-primary-50/10' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Step {idx + 1}</span>
                      {step.status === "completed" && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Done</span>}
                      {step.status === "current" && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">In Progress</span>}
                    </div>
                    <h3 className="text-lg font-bold text-ink-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-ink-600 leading-relaxed max-w-2xl">{step.description}</p>
                  </div>
                  <div className="shrink-0 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500 bg-ink-50 px-2.5 py-1.5 rounded-md border border-ink-100">
                       <BookOpen className="h-3.5 w-3.5" /> {step.resource}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500 bg-ink-50 px-2.5 py-1.5 rounded-md border border-ink-100">
                       <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                       {step.time}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-ink-100">
        <h3 className="text-lg font-bold text-ink-900 mb-4">Deep Dive Action Plan</h3>
        {/* Generation Section */}
        {!customPath && (
          <Card className="p-8 text-center relative overflow-hidden group border-2 border-dashed hover:border-primary-400 transition-all">
            <div className="absolute inset-0 bg-gradient-to-b from-primary-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader 
                  text="Building your custom roadmap..." 
                  secondaryText={`SkillNova is analyzing your gaps in ${missingSkills.slice(0, 3).join(", ")} to create actionable milestones.`} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 shadow-sm mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-ink-900 mb-3">Ready to bridge your skill gaps?</h2>
                <p className="text-ink-500 max-w-md mb-8 leading-relaxed">
                  We've identified that you need to improve in <span className="font-semibold text-primary-600">{missingSkills.join(", ")}</span>. 
                  Click below to generate a step-by-step learning path specifically tailored to those needs.
                </p>
                
                {error && <p className="text-rose-600 text-sm font-medium mb-4">{error}</p>}
                
                <Button onClick={handleGeneratePath} icon={Sparkles} size="lg" className="shadow-glass hover:shadow-glow transition-shadow duration-300">
                  Generate Personalized Path
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Render Generated Path */}
        {customPath && customPath.modules && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink-900">Your Action Plan</h3>
              <Button variant="ghost" size="sm" onClick={handleGeneratePath} disabled={isGenerating}>
                {isGenerating ? "Regenerating..." : "Regenerate Path"}
              </Button>
            </div>
            
            <section className="grid gap-4 lg:grid-cols-2">
              {customPath.modules.map((milestone, idx) => (
                <Card className="min-h-36 border border-ink-100/60 hover:border-primary-200 transition-colors" key={idx}>
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary-50 p-3 text-primary-600 shrink-0 shadow-sm border border-primary-100">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-1 block">Milestone {idx + 1}</span>
                          <h2 className="font-bold text-ink-900 text-base leading-tight">{milestone.title}</h2>
                        </div>
                        <span className="w-fit rounded-full bg-ink-50 px-3 py-1 text-[10px] font-bold text-ink-500 border border-ink-200 shrink-0">
                          {milestone.duration}
                        </span>
                      </div>
                      <p className="text-sm text-ink-600 leading-relaxed">
                        {milestone.description}
                      </p>
                      <ProgressBar className="mt-4 opacity-50" value={0} />
                    </div>
                  </div>
                </Card>
              ))}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
