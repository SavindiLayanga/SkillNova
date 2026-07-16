export const adminStats = [
  { label: "Total users", value: "248", change: "+18 this month" },
  { label: "Uploaded CVs", value: "186", change: "32 this week" },
  { label: "Pending CV reviews", value: "24", change: "Needs attention" },
  { label: "Job recommendations", value: "76", change: "12 new roles" },
  { label: "Course recommendations", value: "112", change: "8 updated paths" },
];

export const adminUsers = [
  {
    id: 1,
    name: "Ayesha Perera",
    email: "ayesha@example.com",
    targetRole: "Junior React Developer",
    status: "Active",
    joined: "2026-05-03",
  },
  {
    id: 2,
    name: "Nimal Fernando",
    email: "nimal@example.com",
    targetRole: "Data Analyst",
    status: "Active",
    joined: "2026-05-08",
  },
  {
    id: 3,
    name: "Sara Mohamed",
    email: "sara@example.com",
    targetRole: "UI Engineer",
    status: "Blocked",
    joined: "2026-04-28",
  },
  {
    id: 4,
    name: "Kavindu Silva",
    email: "kavindu@example.com",
    targetRole: "Backend Intern",
    status: "Active",
    joined: "2026-05-14",
  },
];

export const adminCvReviews = [
  {
    id: 101,
    student: "Ayesha Perera",
    fileName: "Ayesha_CV.pdf",
    uploadedAt: "2026-05-20",
    score: 82,
    status: "Pending",
    summary: "Strong frontend projects. Needs stronger achievement metrics.",
  },
  {
    id: 102,
    student: "Nimal Fernando",
    fileName: "Nimal_Data_CV.pdf",
    uploadedAt: "2026-05-19",
    score: 74,
    status: "Reviewed",
    summary: "Good analytics foundation. Add dashboard and SQL case studies.",
  },
  {
    id: 103,
    student: "Sara Mohamed",
    fileName: "Sara_UI_CV.docx",
    uploadedAt: "2026-05-18",
    score: 69,
    status: "Pending",
    summary: "Creative portfolio. Missing accessibility and testing evidence.",
  },
  {
    id: 104,
    student: "Kavindu Silva",
    fileName: "Kavindu_Backend_CV.pdf",
    uploadedAt: "2026-05-21",
    score: 60,
    status: "In Learning Path",
    summary: "Basic understanding of Node.js. Recommended to complete API design module.",
  },
];

export const adminJobs = [
  {
    id: 1,
    title: "Junior React Developer",
    company: "NovaTech Labs",
    skills: ["React", "JavaScript", "Tailwind", "APIs"],
  },
  {
    id: 2,
    title: "Data Analyst Intern",
    company: "InsightWorks",
    skills: ["SQL", "Excel", "Python", "Dashboards"],
  },
  {
    id: 3,
    title: "Associate UI Engineer",
    company: "CloudNest",
    skills: ["Figma", "React", "Accessibility", "Testing"],
  },
];

export const adminCourses = [
  {
    id: 1,
    title: "React Career Accelerator",
    provider: "SkillNova Academy",
    skills: ["React", "Components", "State", "APIs"],
  },
  {
    id: 2,
    title: "TypeScript for Frontend Engineers",
    provider: "CodePath",
    skills: ["TypeScript", "Typing", "React"],
  },
  {
    id: 3,
    title: "Testing Modern React Apps",
    provider: "Frontend Masters",
    skills: ["Vitest", "Testing Library", "Debugging"],
  },
];

export const adminActivity = [
  "Ayesha uploaded a new CV for analysis.",
  "Nimal completed a recommended SQL course.",
  "Sara was matched with Associate UI Engineer.",
  "Kavindu updated target role preferences.",
];
