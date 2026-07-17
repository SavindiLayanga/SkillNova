import { BookOpen, CheckCircle, Edit3, FileText, Plus, Trash2, Users, Search, Filter, Copy, Archive, Star, Clock, BarChart, Tag, Building } from "lucide-react";
import { useState } from "react";
import AdminCard from "../../components/admin/AdminCard.jsx";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import { adminCourses } from "../../data/adminDummyData.js";

const emptyCourse = {
  title: "",
  provider: "",
  category: "Programming",
  difficulty: "Beginner",
  duration: "",
  language: "English",
  certificate: "Yes",
  thumbnail: null,
  description: "",
  skills: "",
  status: "Draft",
};

export default function AdminCourses() {
  const [courses, setCourses] = useState(adminCourses);
  const [form, setForm] = useState(emptyCourse);
  const [editingId, setEditingId] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const nextCourse = {
      id: editingId ?? Date.now(),
      title: form.title.trim(),
      provider: form.provider.trim(),
      category: form.category,
      difficulty: form.difficulty,
      duration: form.duration.trim(),
      language: form.language.trim(),
      certificate: form.certificate,
      thumbnail: form.thumbnail,
      description: form.description.trim(),
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      status: form.status,
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
      title: course.title || "",
      provider: course.provider || "",
      category: course.category || "Programming",
      difficulty: course.difficulty || "Beginner",
      duration: course.duration || "",
      language: course.language || "English",
      certificate: course.certificate || "Yes",
      thumbnail: null, // Keep null for file input
      description: course.description || "",
      skills: course.skills ? course.skills.join(", ") : "",
      status: course.status || "Draft",
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
        <div className="flex flex-wrap items-center gap-3">
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
              <option value="all_status">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
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
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Course Title *</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Course title"
                required
                value={form.title}
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Provider *</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
                  onChange={(event) => setForm({ ...form, provider: event.target.value })}
                  placeholder="Provider"
                  required
                  value={form.provider}
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  required
                  value={form.category}
                >
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Difficulty</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
                  onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
                  value={form.difficulty}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Duration (e.g. 10 Hours)</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
                  onChange={(event) => setForm({ ...form, duration: event.target.value })}
                  placeholder="e.g. 10 Hours"
                  value={form.duration}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Language</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
                  onChange={(event) => setForm({ ...form, language: event.target.value })}
                  placeholder="e.g. English"
                  value={form.language}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Certificate</label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
                  onChange={(event) => setForm({ ...form, certificate: event.target.value })}
                  value={form.certificate}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Thumbnail Upload</label>
              <input
                type="file"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary-400 bg-white"
                onChange={(event) => setForm({ ...form, thumbnail: event.target.files[0] })}
                accept="image/*"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="min-h-24 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Course description..."
                value={form.description}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Skills</label>
              <textarea
                className="min-h-16 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, skills: event.target.value })}
                placeholder="React, Node, MongoDB"
                value={form.skills}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-400"
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                value={form.status}
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <Button icon={Plus} type="submit" className="w-full mt-2">
              {editingId ? "Update course" : "Add course"}
            </Button>
          </form>
        </AdminCard>

        <div className="space-y-4">
          {courses.map((course) => (
            <AdminCard key={course.id}>
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{course.title}</h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-amber-500">
                        <Star className="h-4 w-4 fill-amber-500" />
                        <Star className="h-4 w-4 fill-amber-500" />
                        <Star className="h-4 w-4 fill-amber-500" />
                        <Star className="h-4 w-4 fill-amber-500" />
                        <Star className="h-4 w-4 fill-amber-500" />
                        <span className="ml-1 font-semibold text-slate-700">{course.rating || "4.8"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium shadow-sm">
                    {course.status === "Published" ? (
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                        {course.status || "Draft"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 border-y border-slate-100 py-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Building className="h-3 w-3" /> Provider</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{course.provider || "SkillNova Academy"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Tag className="h-3 w-3" /> Category</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{course.category || "Frontend"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1"><BarChart className="h-3 w-3" /> Difficulty</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{course.difficulty || "Intermediate"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Duration</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{course.duration || "18 Hours"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Users className="h-3 w-3" /> Students</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{course.students || "1,245"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {course.skills && course.skills.length > 0 ? (
                      course.skills.map((skill) => (
                        <span
                          className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700"
                          key={skill}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No skills listed</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button icon={Edit3} onClick={() => editCourse(course)} size="sm" variant="secondary">
                      Edit
                    </Button>
                    <Button icon={Copy} onClick={() => {}} size="sm" variant="secondary">
                      Duplicate
                    </Button>
                    <Button icon={Archive} onClick={() => {}} size="sm" variant="secondary">
                      Archive
                    </Button>
                    <Button icon={Trash2} onClick={() => deleteCourse(course.id)} size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </AdminCard>
          ))}

          {/* Pagination */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">1-10</span> of <span className="font-semibold text-slate-900">286</span>
            </p>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                &lt; Previous
              </button>
              <div className="flex items-center gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-medium text-white shadow-sm hover:bg-primary-700">1</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">2</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">3</button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">4</button>
                <span className="px-1 text-slate-400">...</span>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">29</button>
              </div>
              <button className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
