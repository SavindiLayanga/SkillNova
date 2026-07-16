import { 
  Edit3, Plus, Trash2, DownloadCloud, ExternalLink, Search, Filter,
  Briefcase, CheckCircle, Clock, X, MapPin, DollarSign, Calendar, Users, Linkedin
} from "lucide-react";
import { useState, useEffect } from "react";
import DOMPurify from 'dompurify';
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import { adminJobsService } from "../../services/adminJobsService.js";

const emptyJob = { 
  title: "", 
  company: "", 
  contactEmail: "",
  companyLogo: "",
  description: "",
  category: "",
  jobType: "",
  experienceRequired: "",
  salaryRange: "",
  numberOfOpenings: 1,
  applicationDeadline: "",
  location: "",
  source: "SkillNova Verified Vacancy",
  status: "Pending Approval",
  skills: [] 
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [skillInput, setSkillInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [employmentFilter, setEmploymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, closed: 0 });

  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInKeyword, setLinkedInKeyword] = useState("");
  const [linkedInLocation, setLinkedInLocation] = useState("");
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const data = await adminJobsService.getJobs({
        page,
        limit: 10,
        search,
        source: sourceFilter,
        status: statusFilter
        // Add other filters if backend supports them later
      });
      const fetchedJobs = data.jobs || [];
      setJobs(fetchedJobs);
      setTotalPages(data.pagination?.totalPages || 1);
      
      // Compute some basic stats for dashboard cards based on current page or we can just show stats for currently loaded items
      // A real app would get stats from backend. We'll simulate for now based on fetched.
      // Or we can just calculate based on the current page for demonstration.
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      alert("Failed to load jobs. Check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, search, sourceFilter, statusFilter, industryFilter, employmentFilter]);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const jobData = { ...form };

      if (editingId) {
        await adminJobsService.updateJob(editingId, jobData);
      } else {
        await adminJobsService.createJob(jobData);
      }
      
      setEditingId(null);
      setForm(emptyJob);
      fetchJobs();
    } catch (error) {
      console.error("Failed to save job:", error);
      alert("Failed to save job.");
    }
  }

  function editJob(job) {
    setEditingId(job._id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      contactEmail: job.contactEmail || "",
      companyLogo: job.companyLogo || "",
      description: job.description || "",
      category: job.category || "",
      jobType: job.jobType || "",
      experienceRequired: job.experienceRequired || "",
      salaryRange: job.salaryRange || "",
      numberOfOpenings: job.numberOfOpenings || 1,
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : "",
      location: job.location || "",
      source: job.source || "SkillNova Verified Vacancy",
      status: job.status || "Pending Approval",
      skills: job.skills || [],
    });
  }

  async function deleteJob(id) {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await adminJobsService.deleteJob(id);
        fetchJobs();
      } catch (error) {
        console.error("Failed to delete job:", error);
        alert("Failed to delete job.");
      }
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await adminJobsService.updateJob(id, { status: newStatus });
      fetchJobs();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status.");
    }
  }

  async function handleImport() {
    if (!window.confirm("Import jobs from We Work Remotely?")) return;
    try {
      setIsImporting(true);
      setImportResult(null);
      const result = await adminJobsService.importJobs();
      setImportResult(result);
      fetchJobs();
    } catch (error) {
      console.error("Failed to import jobs:", error);
      alert("Failed to import jobs.");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleImportLinkedIn(e) {
    e.preventDefault();
    if (!linkedInKeyword) {
      alert("Please enter a job keyword.");
      return;
    }
    try {
      setIsImportingLinkedIn(true);
      setImportResult(null);
      const result = await adminJobsService.importLinkedInJobs(linkedInKeyword, linkedInLocation);
      if (result.success) {
        setImportResult(result);
        setShowLinkedInModal(false);
        setLinkedInKeyword("");
        setLinkedInLocation("");
        fetchJobs();
      } else {
        alert(result.error || "Failed to import jobs from LinkedIn.");
      }
    } catch (error) {
      console.error("Failed to import LinkedIn jobs:", error);
      alert(error.response?.data?.error || "Failed to import LinkedIn jobs. Check console for details.");
    } finally {
      setIsImportingLinkedIn(false);
    }
  }

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!form.skills.includes(skillInput.trim())) {
        setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setForm({ ...form, skills: form.skills.filter(s => s !== skillToRemove) });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'pending approval': return 'bg-amber-100 text-amber-700';
      case 'closed': return 'bg-rose-100 text-rose-700';
      case 'expired': return 'bg-slate-100 text-slate-700';
      case 'inactive': return 'bg-slate-100 text-slate-500';
      case 'archived': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="pb-10">
      <AdminPageHeader
        description="Manage job listings, approve vacancies, and track recruitment metrics."
        title="Recruitment Dashboard"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
         {/* Placeholder stats */}
         <AdminCard className="flex items-center gap-4">
           <div className="p-3 bg-primary-50 rounded-lg text-primary-600"><Briefcase size={24} /></div>
           <div>
             <p className="text-sm text-slate-500 font-medium">Total Vacancies</p>
             <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
           </div>
         </AdminCard>
         <AdminCard className="flex items-center gap-4">
           <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle size={24} /></div>
           <div>
             <p className="text-sm text-slate-500 font-medium">Active Jobs</p>
             <p className="text-2xl font-bold text-slate-900">{jobs.filter(j => j.status?.toLowerCase() === 'active').length}</p>
           </div>
         </AdminCard>
         <AdminCard className="flex items-center gap-4">
           <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Clock size={24} /></div>
           <div>
             <p className="text-sm text-slate-500 font-medium">Pending Approval</p>
             <p className="text-2xl font-bold text-slate-900">{jobs.filter(j => j.status?.toLowerCase() === 'pending approval').length}</p>
           </div>
         </AdminCard>
         <AdminCard className="flex items-center gap-4">
           <div className="p-3 bg-rose-50 rounded-lg text-rose-600"><X size={24} /></div>
           <div>
             <p className="text-sm text-slate-500 font-medium">Closed Jobs</p>
             <p className="text-2xl font-bold text-slate-900">{jobs.filter(j => j.status?.toLowerCase() === 'closed').length}</p>
           </div>
         </AdminCard>
      </div>

      {importResult && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 border border-emerald-200">
          <h3 className="text-emerald-800 font-bold mb-2">Import Successful: {importResult.source}</h3>
          <ul className="text-sm text-emerald-700 list-disc list-inside">
            <li>Found: {importResult.found}</li>
            <li>Created: {importResult.created}</li>
            <li>Updated: {importResult.updated}</li>
            <li>Skipped: {importResult.skipped}</li>
            <li>Failed: {importResult.failed}</li>
          </ul>
          <button onClick={() => setImportResult(null)} className="text-emerald-600 underline text-xs mt-2">Dismiss</button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
            />
          </div>
          
          <select 
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="all">All Sources</option>
            <option value="SkillNova Verified Vacancy">SkillNova Verified</option>
            <option value="RSS Imported Job">RSS Imported</option>
            <option value="LinkedIn Imported Job">LinkedIn Imported</option>
            <option value="We Work Remotely">We Work Remotely</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending Approval">Pending</option>
            <option value="Closed">Closed</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button icon={Linkedin} onClick={() => setShowLinkedInModal(true)} disabled={isImporting || isImportingLinkedIn} className="bg-[#0A66C2] hover:bg-[#084e96] text-white border-none">
            {isImportingLinkedIn ? "Importing..." : "Import LinkedIn Jobs"}
          </Button>
          <Button icon={DownloadCloud} onClick={handleImport} disabled={isImporting || isImportingLinkedIn} variant="secondary">
            {isImporting ? "Importing..." : "Import RSS Jobs"}
          </Button>
        </div>
      </div>

      {showLinkedInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <AdminCard className="w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Linkedin size={20} className="text-[#0A66C2]"/> Import from LinkedIn
              </h3>
              <button onClick={() => setShowLinkedInModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleImportLinkedIn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Job Keyword *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Software Engineer" 
                  value={linkedInKeyword}
                  onChange={e => setLinkedInKeyword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0A66C2]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sri Lanka" 
                  value={linkedInLocation}
                  onChange={e => setLinkedInLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0A66C2]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isImportingLinkedIn} className="flex-1 bg-[#0A66C2] hover:bg-[#084e96] border-none text-white">
                  {isImportingLinkedIn ? "Importing..." : "Import Jobs"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowLinkedInModal(false)}>Cancel</Button>
              </div>
            </form>
          </AdminCard>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <AdminCard className="self-start">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Plus size={20} className="text-primary-600" />
            {editingId ? "Edit Vacancy" : "Create Vacancy"}
          </h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Basic Information</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Job Title *"
                required
                value={form.title}
              />
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, company: event.target.value })}
                placeholder="Company Name *"
                required
                value={form.company}
              />
              <input
                type="email"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
                placeholder="Contact Email"
                value={form.contactEmail}
              />
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, companyLogo: event.target.value })}
                placeholder="Company Logo URL"
                value={form.companyLogo}
              />
            </div>

            <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-600">Job Details</label>
               <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                placeholder="Industry (e.g. IT, Healthcare)"
                value={form.category}
              />
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, jobType: event.target.value })}
                value={form.jobType}
              >
                <option value="">Select Employment Type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, experienceRequired: event.target.value })}
                placeholder="Experience Required (e.g. 2-3 Years)"
                value={form.experienceRequired}
              />
               <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, salaryRange: event.target.value })}
                placeholder="Salary Range (e.g. $80k - $100k)"
                value={form.salaryRange}
              />
               <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                placeholder="Location (e.g. Remote, New York)"
                value={form.location}
              />
               <div className="flex gap-2">
                 <input
                  type="number"
                  min="1"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
                  onChange={(event) => setForm({ ...form, numberOfOpenings: event.target.value })}
                  placeholder="Openings"
                  value={form.numberOfOpenings}
                />
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400 text-slate-500"
                  onChange={(event) => setForm({ ...form, applicationDeadline: event.target.value })}
                  value={form.applicationDeadline}
                />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-600">Source & Status</label>
               <select
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, source: event.target.value })}
                value={form.source}
              >
                <option value="SkillNova Verified Vacancy">SkillNova Verified Vacancy</option>
                <option value="RSS Imported Job">RSS Imported Job</option>
              </select>
               <select
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                value={form.status}
              >
                <option value="Pending Approval">Pending Approval</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Description</label>
              <textarea
                className="min-h-24 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Job Description..."
                value={form.description}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Required Skills</label>
              <div className="p-2 border border-slate-200 rounded-lg focus-within:border-primary-400 flex flex-wrap gap-2">
                {form.skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-primary-900"><X size={12}/></button>
                  </span>
                ))}
                <input
                  className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
                  placeholder={form.skills.length === 0 ? "Type skill & press enter" : ""}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Save Changes" : "Publish Vacancy"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyJob); }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </AdminCard>

        <div className="space-y-4">
          {isLoading ? (
             <div className="text-center py-10 text-slate-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
             <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">No vacancies found.</div>
          ) : (
            jobs.map((job) => (
              <AdminCard key={job._id} className="hover:border-primary-200 transition-colors">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="hidden sm:block">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.company} className="w-16 h-16 rounded-lg object-contain bg-slate-50 border border-slate-100" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xl font-bold">
                        {job.company.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-slate-950">{job.title}</h3>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-primary-600">{job.company}</p>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap sm:flex-nowrap shrink-0">
                         <select 
                            className="text-xs border border-slate-200 rounded px-2 py-1 outline-none text-slate-600"
                            value={job.status || "Pending Approval"}
                            onChange={(e) => handleStatusChange(job._id, e.target.value)}
                         >
                            <option value="Pending Approval">Set Pending</option>
                            <option value="Active">Set Active</option>
                            <option value="Closed">Set Closed</option>
                            <option value="Expired">Set Expired</option>
                         </select>
                         <Button icon={Users} size="sm" variant="secondary" className="text-xs py-1" onClick={() => alert("View Applications placeholder")}>
                            Apps
                         </Button>
                         <Button icon={Edit3} onClick={() => editJob(job)} size="sm" variant="ghost" className="text-xs p-1" />
                         <Button icon={Trash2} onClick={() => deleteJob(job._id)} size="sm" variant="ghost" className="text-xs p-1 text-rose-500 hover:text-rose-600" />
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                      {job.location && <span className="flex items-center gap-1"><MapPin size={14}/> {job.location}</span>}
                      {job.jobType && <span className="flex items-center gap-1"><Briefcase size={14}/> {job.jobType}</span>}
                      {job.salaryRange && <span className="flex items-center gap-1"><DollarSign size={14}/> {job.salaryRange}</span>}
                      {job.experienceRequired && <span className="flex items-center gap-1"><Clock size={14}/> {job.experienceRequired}</span>}
                      {job.applicationDeadline && <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(job.applicationDeadline).toLocaleDateString()}</span>}
                    </div>

                    {job.description && (
                      <div 
                        className="mt-4 text-sm text-slate-600 line-clamp-2 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
                      />
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(job.skills || []).map((skill) => (
                        <span
                          className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600"
                          key={skill}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Source: <strong>{job.source}</strong></span>
                      {job.sourceUrl && (
                        <a 
                          href={job.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary-600 hover:underline font-medium"
                        >
                          Original Listing <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </AdminCard>
            ))
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
