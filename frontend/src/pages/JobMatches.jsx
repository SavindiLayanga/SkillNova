import { useState, useEffect } from "react";
import { MapPin, SlidersHorizontal, Search, X } from "lucide-react";
import AnalysisEmptyState from "../components/ui/AnalysisEmptyState.jsx";
import AnalysisProcessingState from "../components/ui/AnalysisProcessingState.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import useCVAnalysis from "../hooks/useCVAnalysis.js";
import { userMatchesService } from "../services/userMatchesService.js";
import useAuth from "../hooks/useAuth.js";

export default function JobMatches() {
  const { hasAnalysis, status } = useCVAnalysis();
  const { getToken } = useAuth();

  const [realJobs, setRealJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJobType, setFilterJobType] = useState("All");
  
  useEffect(() => {
    let isMounted = true;
    if (hasAnalysis && status === "analyzed") {
      setIsLoading(true);
      getToken().then(token => {
        if (!token) return;
        return userMatchesService.getJobMatches(token);
      })
      .then(jobs => {
        if (isMounted && jobs) setRealJobs(jobs);
      })
      .catch(err => {
        if (isMounted) console.error("Failed to load jobs", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    }
    return () => { isMounted = false; };
  }, [hasAnalysis, status, getToken]);

  let jobMatches = realJobs;
  
  // Filter out completely empty objects that might have been returned by AI's default structure
  jobMatches = jobMatches.filter(job => {
    if (typeof job === 'string') return job.trim().length > 0;
    return job && (job.role || job.company || job.title);
  });

  if (searchQuery) {
    jobMatches = jobMatches.filter(job => {
      if (typeof job === 'string') return job.toLowerCase().includes(searchQuery.toLowerCase());
      return (job.title || job.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
             (job.company || "").toLowerCase().includes(searchQuery.toLowerCase());
    });
  }

  if (filterJobType !== "All") {
    jobMatches = jobMatches.filter(job => {
      if (typeof job === 'string') return false;
      return job.jobType === filterJobType;
    });
  }

  const jobTypes = ["All", ...new Set(realJobs.map(j => j.jobType).filter(Boolean))];

  return (
    <div className="space-y-6">
      <PageHeader
        action={
          hasAnalysis ? (
            <Button 
              icon={showFilters ? X : SlidersHorizontal} 
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Close Filters" : "Filters"}
            </Button>
          ) : null
        }
        description="Review roles that fit your current CV and learning roadmap after analysis."
        eyebrow="Job Matches"
        title="Find opportunities that match your next step"
      />

      {showFilters && (
        <Card className="p-4 flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-200">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title or company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Type:</label>
            <select
              value={filterJobType}
              onChange={(e) => setFilterJobType(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-400"
            >
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {status === "noCV" ? <AnalysisEmptyState /> : null}
      {status === "uploading" || status === "analyzing" ? (
        <AnalysisProcessingState status={status} />
      ) : null}

      {hasAnalysis && jobMatches.length > 0 ? (
      <section className="grid gap-5">
        {jobMatches.map((job, idx) => {
          if (typeof job === 'string') {
            return (
              <Card key={`${job}-${idx}`}>
                 <div className="flex flex-col gap-2">
                   <h2 className="text-xl font-bold text-ink-900">{job}</h2>
                   <p className="text-sm text-ink-500">Please run a new analysis to see full job details like company, salary, and match score.</p>
                 </div>
              </Card>
            );
          }

          return (
          <Card key={job._id || `${job.company}-${job.title}-${idx}`}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-ink-900">{job.title || job.role}</h2>
                  {job.jobType && (
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                      {job.jobType}
                    </span>
                  )}
                  {job.source && (
                    <span className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-xs font-bold text-green-700">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                      </svg>
                      {job.source}
                    </span>
                  )}
                </div>
                {job.company && <p className="mt-2 font-semibold text-ink-700">{job.company}</p>}
                {(job.location || job.salaryRange) && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-ink-500">
                    <MapPin className="h-4 w-4" />
                    {[job.location, job.salaryRange].filter(Boolean).join(" - ")}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.skills && job.skills.map((skill) => (
                    <span
                      className="rounded-full bg-ink-50 px-3 py-1 text-xs font-semibold text-ink-600"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-64">
                <div className="mb-2 flex justify-between text-sm font-semibold">
                  <span className="text-ink-700">Match score</span>
                  <span className="text-primary-700">{job.match || 0}%</span>
                </div>
                <ProgressBar value={job.match || 0} />
                <Button 
                  className="mt-5 w-full" 
                  onClick={() => job.url && window.open(job.url, "_blank")}
                  disabled={!job.url}
                >
                  {job.url ? "View details" : "Details not available"}
                </Button>
              </div>
            </div>
          </Card>
        )})}
      </section>
      ) : hasAnalysis && jobMatches.length === 0 ? (
        <Card className="text-center p-8">
          <h3 className="font-bold text-ink-900 text-lg">No Job Matches Found</h3>
          <p className="text-ink-500 mt-2">We couldn't find any direct matches based on your current skills. Try completing some learning milestones!</p>
        </Card>
      ) : null}
    </div>
  );
}
