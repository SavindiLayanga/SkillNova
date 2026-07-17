import { BookOpen, CheckCircle, Edit3, FileText, Plus, Trash2, Users, Search, Filter } from "lucide-react";
import { useState } from "react";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import { adminCourses } from "../../data/adminDummyData.js";

const emptyCourse = { provider: "", skills: "", title: "" };

export default function AdminCourses() {
  const [courses, setCourses] = useState(adminCourses);
  const [form, setForm] = useState(emptyCourse);
  const [editingId, setEditingId] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const nextCourse = {
      id: editingId ?? Date.now(),
      provider: form.provider.trim(),
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      title: form.title.trim(),
    };

    setCourses((currentCourses) =>
      editingId
        ? currentCourses.map((course) =>
            course.id === editingId ? nextCourse : course
          )
        : [nextCourse, ...currentCourses]
    );
    setEditingId(null);
    setForm(emptyCourse);
  }

  function editCourse(course) {
    setEditingId(course.id);
    setForm({
      provider: course.provider,
      skills: course.skills.join(", "),
      title: course.title,
    });
  }

  function deleteCourse(id) {
    setCourses((currentCourses) =>
      currentCourses.filter((course) => course.id !== id)
    );
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Courses</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </AdminCard>
        
        <AdminCard className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Published</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </AdminCard>

        <AdminCard className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Draft</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </AdminCard>

        <AdminCard className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Enrollments</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </AdminCard>
      </div>

      <AdminPageHeader
        description="Manage course recommendations and the skills each course covers."
        title="Courses"
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select className="appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-1 focus:ring-primary-400">
              <option value="all_categories">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
          <div className="relative">
            <select className="appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-1 focus:ring-primary-400">
              <option value="all_providers">All Providers</option>
              <option value="coursera">Coursera</option>
              <option value="udemy">Udemy</option>
              <option value="edx">edX</option>
            </select>
          </div>
          <div className="relative">
            <select className="appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary-400 focus:ring-1 focus:ring-primary-400">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminCard>
          <h2 className="text-lg font-bold text-slate-950">
            {editingId ? "Edit course" : "Add course"}
          </h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Course title"
              required
              value={form.title}
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
              onChange={(event) => setForm({ ...form, provider: event.target.value })}
              placeholder="Provider"
              required
              value={form.provider}
            />
            <textarea
              className="min-h-28 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
              onChange={(event) => setForm({ ...form, skills: event.target.value })}
              placeholder="Skills covered, comma separated"
              required
              value={form.skills}
            />
            <Button icon={Plus} type="submit">
              {editingId ? "Update course" : "Add course"}
            </Button>
          </form>
        </AdminCard>

        <div className="space-y-4">
          {courses.map((course) => (
            <AdminCard key={course.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-950">{course.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{course.provider}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.skills.map((skill) => (
                      <span
                        className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700"
                        key={skill}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button icon={Edit3} onClick={() => editCourse(course)} size="sm" variant="secondary">
                    Edit
                  </Button>
                  <Button icon={Trash2} onClick={() => deleteCourse(course.id)} size="sm" variant="ghost">
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
