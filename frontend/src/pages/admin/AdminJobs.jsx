import { Edit3, Plus, Trash2, DownloadCloud, ExternalLink, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import DOMPurify from 'dompurify';
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import { adminJobsService } from "../../services/adminJobsService.js";

const emptyJob = { company: "", skills: "", title: "", description: "" };

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const data = await adminJobsService.getJobs({
        page,
        limit: 10,
        search,
        source: sourceFilter,
        status: statusFilter
      });
      setJobs(data.jobs || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      alert("Failed to load jobs. Check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, search, sourceFilter, statusFilter]);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const jobData = {
        title: form.title.trim(),
        company: form.company.trim(),
        description: form.description.trim(),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };

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
      company: job.company || "",
      skills: (job.skills || []).join(", "),
      title: job.title || "",
      description: job.description || "",
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

  return (
    <div>
      <AdminPageHeader
        description="Create and maintain job roles used by the recommendation engine prototype."
        title="Jobs"
      />

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

      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="relative max-w-xs w-full">
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
            <option value="SkillNova Admin">SkillNova Admin</option>
            <option value="We Work Remotely">We Work Remotely</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <Button icon={DownloadCloud} onClick={handleImport} disabled={isImporting} variant="secondary">
          {isImporting ? "Importing..." : "Import RSS Jobs"}
        </Button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminCard>
          <h2 className="text-lg font-bold text-slate-950">
            {editingId ? "Edit job role" : "Add manual job"}
          </h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Job title"
              required
              value={form.title}
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
              onChange={(event) => setForm({ ...form, company: event.target.value })}
              placeholder="Company"
              required
              value={form.company}
            />
            <textarea
              className="min-h-20 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Job Description (Optional)"
              value={form.description}
            />
            <textarea
              className="min-h-20 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
              onChange={(event) => setForm({ ...form, skills: event.target.value })}
              placeholder="Required skills, comma separated"
              required
              value={form.skills}
            />
            <div className="flex gap-2">
              <Button icon={Plus} type="submit">
                {editingId ? "Update job" : "Add job"}
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
             <div className="text-center py-10 text-slate-500">No jobs found.</div>
          ) : (
            jobs.map((job) => (
              <AdminCard key={job._id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-950">{job.title}</h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${job.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-600">{job.company}</p>
                    
                    <div className="mt-2 text-xs text-slate-500 flex items-center gap-4">
                      <span>Source: <strong>{job.source}</strong></span>
                      {job.publishedAt && <span>Posted: {new Date(job.publishedAt).toLocaleDateString()}</span>}
                    </div>

                    {job.description && (
                      <div 
                        className="mt-3 text-sm text-slate-600 line-clamp-3 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
                      />
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(job.skills || []).map((skill) => (
                        <span
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                          key={skill}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    {job.sourceUrl && (
                      <a 
                        href={job.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
                      >
                        View original listing <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button icon={Edit3} onClick={() => editJob(job)} size="sm" variant="secondary">
                      Edit
                    </Button>
                    <Button icon={Trash2} onClick={() => deleteJob(job._id)} size="sm" variant="ghost">
                      Delete
                    </Button>
                  </div>
                </div>
              </AdminCard>
            ))
          )}
          
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-slate-100 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-slate-100 rounded text-sm disabled:opacity-50"
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
