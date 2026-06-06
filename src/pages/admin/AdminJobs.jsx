import { Edit3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import { adminJobs } from "../../data/adminDummyData.js";

const emptyJob = { company: "", skills: "", title: "" };

export default function AdminJobs() {
  const [jobs, setJobs] = useState(adminJobs);
  const [form, setForm] = useState(emptyJob);
  const [editingId, setEditingId] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const nextJob = {
      company: form.company.trim(),
      id: editingId ?? Date.now(),
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      title: form.title.trim(),
    };

    setJobs((currentJobs) =>
      editingId
        ? currentJobs.map((job) => (job.id === editingId ? nextJob : job))
        : [nextJob, ...currentJobs]
    );
    setEditingId(null);
    setForm(emptyJob);
  }

  function editJob(job) {
    setEditingId(job.id);
    setForm({
      company: job.company,
      skills: job.skills.join(", "),
      title: job.title,
    });
  }

  function deleteJob(id) {
    setJobs((currentJobs) => currentJobs.filter((job) => job.id !== id));
  }

  return (
    <div>
      <AdminPageHeader
        description="Create and maintain job roles used by the recommendation engine prototype."
        title="Jobs"
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminCard>
          <h2 className="text-lg font-bold text-slate-950">
            {editingId ? "Edit job role" : "Add job role"}
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
              className="min-h-28 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
              onChange={(event) => setForm({ ...form, skills: event.target.value })}
              placeholder="Required skills, comma separated"
              required
              value={form.skills}
            />
            <Button icon={Plus} type="submit">
              {editingId ? "Update job" : "Add job"}
            </Button>
          </form>
        </AdminCard>

        <div className="space-y-4">
          {jobs.map((job) => (
            <AdminCard key={job.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-950">{job.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{job.company}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                        key={skill}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button icon={Edit3} onClick={() => editJob(job)} size="sm" variant="secondary">
                    Edit
                  </Button>
                  <Button icon={Trash2} onClick={() => deleteJob(job.id)} size="sm" variant="ghost">
                    Delete
                  </Button>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      </section>
    </div>
  );
}
