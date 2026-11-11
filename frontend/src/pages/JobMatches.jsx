import { useState, useEffect } from "react";
import { MapPin, SlidersHorizontal, Search, X, Send, CheckCircle, ExternalLink, Sparkles, FileText } from "lucide-react";
import AnalysisEmptyState from "../components/ui/AnalysisEmptyState.jsx";
import AnalysisProcessingState from "../components/ui/AnalysisProcessingState.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import ApplicationPreviewModal from "../components/ui/ApplicationPreviewModal.jsx";
import ApplicationDetailsModal from "../components/ui/ApplicationDetailsModal.jsx";
import useCVAnalysis from "../hooks/useCVAnalysis.js";
import { userMatchesService } from "../services/userMatchesService.js";
import { jobReadinessService } from "../services/jobReadinessService.js";
import useAuth from "../hooks/useAuth.js";

export default function JobMatches() {
  const { hasAnalysis, status } = useCVAnalysis();
  const { getToken } = useAuth();

  const [realJobs, setRealJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [applicationsMap, setApplicationsMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJobType, setFilterJobType] = useState("All");

  // Modals state
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [selectedAppForDetails, setSelectedAppForDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (hasAnalysis && status === "analyzed") {
      setIsLoading(true);
      getToken().then(token => {
        if (!token) return;
        return Promise.all([
          userMatchesService.getJobMatches(token),
          jobReadinessService.getAppliedJobIds(token).catch(() => ({ appliedJobIds: [], applications: [] }))
        ]);
      })
      .then(([jobs, appliedData]) => {
        if (!isMounted) return;
        if (jobs) setRealJobs(jobs);
        if (appliedData) {
          setAppliedJobIds(appliedData.appliedJobIds || []);
          const map = {};
          (appliedData.applications || []).forEach(app => {
            const jId = app.jobId?._id || app.jobId;
            if (jId) map[jId.toString()] = app;
          });
          setApplicationsMap(map);
        }
      })
      .catch(err => {
        if (isMounted) console.error("Failed to load jobs or applications", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    }
    return () => { isMounted = false; };
  }, [hasAnalysis, status, getToken]);

  const handleApplicationSuccess = (jobId, result) => {
    setAppliedJobIds(prev => [...prev, jobId.toString()]);
    if (result?.introduction) {
      setApplicationsMap(prev => ({
        ...prev,
        [jobId.toString()]: result.introduction
      }));
    }
    setToastMessage("Application & CV successfully dispatched to the company!");
    setTimeout(() => setToastMessage(""), 5000);
  };

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
        description="Review roles that fit your current CV, skill progress, and automated job dispatch opportunities."
        eyebrow="Job Matches & Applications"
        title="Find opportunities that match your next step"
      />

      {/* Success Toast */}
      {toastMessage && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 animate-fadeIn">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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

          const isApplied = job._id && appliedJobIds.includes(job._id.toString());
          const applicationRecord = job._id ? applicationsMap[job._id.toString()] : null;
          const isHighMatch = (job.match || 0) >= 80;

          return (
          <Card key={job._id || `${job.company}-${job.title}-${idx}`} className={isHighMatch ? "border-primary-200 shadow-sm" : ""}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-ink-900">{job.title || job.role}</h2>
                  {job.jobType && (
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                      {job.jobType}
                    </span>
                  )}
                  {isApplied && (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle size={13} />
                      Application & CV Sent
                    </span>
                  )}
                  {!isApplied && isHighMatch && (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-700">
                      <Sparkles size={13} />
                      Strong Match
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

              {/* Match Score & Actions */}
              <div className="w-full lg:w-72">
                <div className="mb-2 flex justify-between text-sm font-semibold">
                  <span className="text-ink-700">Match score</span>
                  <span className={isHighMatch ? "text-emerald-600 font-extrabold" : "text-primary-700"}>
                    {job.match || 0}%
                  </span>
                </div>
                <ProgressBar value={job.match || 0} />

                <div className="mt-4 flex flex-col gap-2">
                  {isApplied ? (
                    <Button 
                      variant="secondary"
                      icon={FileText}
                      className="w-full"
                      onClick={() => setSelectedAppForDetails(applicationRecord || { jobId: job, status: 'Sent' })}
                    >
                      View Dispatched App
                    </Button>
                  ) : (
                    <Button 
                      icon={Send}
                      className="w-full"
                      onClick={() => setSelectedJobForApply(job)}
                    >
                      Apply with CV
                    </Button>
                  )}

                  {job.url && (
                    <Button 
                      variant="outline"
                      icon={ExternalLink}
                      className="w-full text-xs"
                      onClick={() => window.open(job.url, "_blank")}
                    >
                      Original Listing
                    </Button>
                  )}
                </div>
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

      {/* Application Preview & Send Modal */}
      <ApplicationPreviewModal
        isOpen={Boolean(selectedJobForApply)}
        onClose={() => setSelectedJobForApply(null)}
        job={selectedJobForApply}
        onApplicationSent={handleApplicationSuccess}
      />

      {/* Dispatched Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={Boolean(selectedAppForDetails)}
        onClose={() => setSelectedAppForDetails(null)}
        application={selectedAppForDetails}
      />
    </div>
  );
}
