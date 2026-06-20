import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  LineChart,
  Target,
  UploadCloud,
} from "lucide-react";

export const studentProfile = {
  name: "Ayesha Perera",
  track: "Frontend Developer",
  completion: 68,
  cvScore: 82,
  targetRole: "Junior React Developer",
};

export const dashboardStats = [
  {
    label: "CV Score",
    value: "82%",
    trend: "+12%",
    icon: FileText,
    tone: "primary",
  },
  {
    label: "Skill Gaps",
    value: "6",
    trend: "3 priority",
    icon: Target,
    tone: "rose",
  },
  {
    label: "Course Matches",
    value: "14",
    trend: "5 new",
    icon: GraduationCap,
    tone: "emerald",
  },
  {
    label: "Job Matches",
    value: "9",
    trend: "2 strong",
    icon: BriefcaseBusiness,
    tone: "blue",
  },
];

export const recentActivity = [
  {
    title: "Uploaded CV",
    description: "Software Engineering Internship CV analyzed successfully.",
    time: "Today",
    icon: UploadCloud,
  },
  {
    title: "React course started",
    description: "Completed the first two lessons in Advanced React Patterns.",
    time: "Yesterday",
    icon: LineChart,
  },
  {
    title: "New role match",
    description: "Junior Frontend Developer at NovaTech scored 91%.",
    time: "2 days ago",
    icon: BriefcaseBusiness,
  },
];

export const skillGaps = [
  {
    skill: "TypeScript",
    current: 42,
    required: 80,
    priority: "High",
    recommendation: "Complete a practical TypeScript for React course.",
  },
  {
    skill: "API Integration",
    current: 58,
    required: 78,
    priority: "High",
    recommendation: "Build two projects using REST APIs and auth flows.",
  },
  {
    skill: "Testing",
    current: 30,
    required: 70,
    priority: "Medium",
    recommendation: "Learn component testing with Vitest and Testing Library.",
  },
  {
    skill: "UI Accessibility",
    current: 50,
    required: 72,
    priority: "Medium",
    recommendation: "Review WCAG basics and audit an existing project.",
  },
];

export const courses = [
  {
    title: "React Career Accelerator",
    provider: "SkillNova Academy",
    duration: "5 weeks",
    level: "Intermediate",
    match: 94,
  },
  {
    title: "TypeScript for Frontend Engineers",
    provider: "CodePath",
    duration: "4 weeks",
    level: "Beginner",
    match: 91,
  },
  {
    title: "Testing Modern React Apps",
    provider: "Frontend Masters",
    duration: "3 weeks",
    level: "Intermediate",
    match: 86,
  },
];

export const jobMatches = [
  {
    role: "Software Engineering Intern",
    company: "WSO2 Sri Lanka",
    location: "Colombo / Hybrid",
    type: "Internship",
    match: 94,
    salary: "Negotiable",
    skills: ["Java", "React", "APIs", "Ballerina"],
    source: "Jobs & Interns WhatsApp Channel",
    url: "https://whatsapp.com/channel/0029Va9Xpxx8PgsOtsAbFn45",
  },
  {
    role: "Junior Frontend Developer",
    company: "Sysco LABS",
    location: "Colombo",
    type: "Full-time",
    match: 89,
    salary: "Competitive",
    skills: ["React", "TypeScript", "Redux", "AWS"],
    source: "Jobs & Interns WhatsApp Channel",
    url: "https://whatsapp.com/channel/0029Va9Xpxx8PgsOtsAbFn45",
  },
  {
    role: "UI/UX Engineering Intern",
    company: "IFS",
    location: "Colombo / Remote",
    type: "Internship",
    match: 82,
    salary: "Allowance Provided",
    skills: ["Figma", "HTML", "CSS", "React"],
    source: "Jobs & Interns WhatsApp Channel",
    url: "https://whatsapp.com/channel/0029Va9Xpxx8PgsOtsAbFn45",
  },
  {
    role: "Associate Software Engineer",
    company: "Virtusa",
    location: "Colombo",
    type: "Full-time",
    match: 75,
    salary: "LKR 100k - 150k",
    skills: ["Java", "Spring Boot", "React", "MySQL"],
    source: "Jobs & Interns WhatsApp Channel",
    url: "https://whatsapp.com/channel/0029Va9Xpxx8PgsOtsAbFn45",
  },
];

export const milestones = [
  {
    title: "Upload and analyze CV",
    status: "Completed",
    progress: 100,
  },
  {
    title: "Finish TypeScript fundamentals",
    status: "In progress",
    progress: 62,
  },
  {
    title: "Build portfolio API project",
    status: "In progress",
    progress: 48,
  },
  {
    title: "Apply to five matched roles",
    status: "Planned",
    progress: 20,
  },
];

export const learningProgress = [
  { label: "React", value: 78 },
  { label: "TypeScript", value: 46 },
  { label: "Testing", value: 35 },
  { label: "APIs", value: 57 },
];

export const weeklyFocus = [
  {
    day: "Mon",
    hours: 2.5,
  },
  {
    day: "Tue",
    hours: 1.5,
  },
  {
    day: "Wed",
    hours: 3,
  },
  {
    day: "Thu",
    hours: 2,
  },
  {
    day: "Fri",
    hours: 2.8,
  },
  {
    day: "Sat",
    hours: 1,
  },
  {
    day: "Sun",
    hours: 1.8,
  },
];

export const chartIcon = BarChart3;
