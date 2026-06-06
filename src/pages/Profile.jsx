import { useState } from "react";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Mail,
  MapPin,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import useCVAnalysis from "../hooks/useCVAnalysis.js";
import useAuth from "../hooks/useAuth.js";
import AnalysisEmptyState from "../components/ui/AnalysisEmptyState.jsx";
import AnalysisProcessingState from "../components/ui/AnalysisProcessingState.jsx";

const tabs = [
  "Overview",
  "Career Goal",
  "Skills",
  "Experience",
  "Education",
  "Certifications",
];

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-ink-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-ink-500">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
      {children}
    </span>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { analysis, hasAnalysis, status } = useCVAnalysis();
  const [activeTab, setActiveTab] = useState("Overview");

  if (status === "noCV") {
    return (
      <div className="space-y-8">
        <PageHeader
          description="Review your student profile information used by SkillNova recommendations."
          eyebrow="Profile"
          title="Career profile"
        />
        <AnalysisEmptyState />
      </div>
    );
  }

  if (status === "uploading" || status === "analyzing") {
    return (
      <div className="space-y-8">
        <PageHeader
          description="Review your student profile information used by SkillNova recommendations."
          eyebrow="Profile"
          title="Career profile"
        />
        <AnalysisProcessingState status={status} />
      </div>
    );
  }

  const name = analysis?.name && analysis.name !== "User" && analysis.name !== "Candidate's full name" 
    ? analysis.name 
    : user?.name || "SkillNova User";
    
  const initials = getInitials(name) || "SN";
  
  const targetRole = analysis?.targetRole && analysis.targetRole !== "Unknown Role" 
    ? analysis.targetRole 
    : user?.targetRole || "Unknown Role";
    
  const email = analysis?.email && analysis.email !== "Candidate's email address"
    ? analysis.email 
    : user?.email || "No email provided";
  
  const extracted = analysis?.extracted || {};
  const experience = extracted.experience || [];
  const education = extracted.education || [];
  const certifications = extracted.certifications || [];
  const skills = extracted.skills || [];
  const projects = extracted.projects || [];
  
  const missingSkills = analysis?.missingSkills || [];
  const skillScore = analysis?.skillMatchScore || 0;
  const careerMatches = analysis?.careerRecommendations || [];

  return (
    <div className="space-y-8">
      <PageHeader
        description="Review your profile information extracted from your CV."
        eyebrow="Profile"
        title="Career profile"
      />

      <Card>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-3xl font-black text-primary-600 ring-4 ring-white shadow-soft">
              {initials}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-ink-900">{name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-medium text-ink-500">
                <span className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary-500" />
                  {targetRole}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-primary-500" />
                  {email}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.slice(0, 5).map((s, i) => (
                  <Pill key={i}>{s.name}</Pill>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-lg border border-ink-100 bg-white p-2 shadow-soft">
          {tabs.map((tab) => (
            <button
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-primary-500 text-white"
                  : "text-ink-500 hover:bg-primary-50 hover:text-primary-700"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-6 animate-fade-in-slide-up" key={activeTab}>
        {activeTab === "Overview" && (
          <Card>
            <SectionHeading
              description="A concise snapshot of your current career direction based on your CV."
              icon={User}
              title="About Me"
            />
            <p className="text-sm leading-7 text-ink-600">
              {analysis?.aiInsights || "No overview available."}
            </p>
          </Card>
        )}

        {activeTab === "Career Goal" && (
          <Card>
            <SectionHeading
              description="The role SkillNova uses to personalize recommendations."
              icon={Target}
              title="Career Goal"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-ink-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">
                  Target Role
                </p>
                <p className="mt-2 font-bold text-ink-900">{targetRole}</p>
              </div>
              <div className="rounded-lg bg-ink-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">
                  Career Match Score
                </p>
                <p className="mt-2 font-bold text-ink-900">{skillScore}%</p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "Skills" && (
          <Card>
            <SectionHeading
              description="Skills extracted directly from your CV."
              icon={ChartNoAxesCombined}
              title="Current Skills"
            />
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    className="rounded-full bg-ink-50 border border-ink-100 px-3 py-1 text-sm font-semibold text-ink-700"
                    key={idx}
                  >
                    {skill.name} <span className="text-xs font-normal text-ink-500">({skill.category})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No skills found in CV.</p>
            )}
          </Card>
        )}

        {activeTab === "Experience" && (
          <Card>
            <SectionHeading
              description="Relevant work, project, and leadership experience extracted from your CV."
              icon={BriefcaseBusiness}
              title="Experience"
            />
            {experience.length > 0 ? (
              <div className="space-y-4">
                {experience.map((item, idx) => (
                  <div className="rounded-lg border border-ink-100 p-4" key={idx}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-bold text-ink-900">{item.role}</h3>
                        <p className="mt-1 text-sm text-ink-500">{item.place}</p>
                      </div>
                      {item.period && <Pill>{item.period}</Pill>}
                    </div>
                    {item.detail && (
                      <p className="mt-3 text-sm leading-6 text-ink-600">
                        {item.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No experience found in CV.</p>
            )}
          </Card>
        )}

        {activeTab === "Education" && (
          <Card>
            <SectionHeading
              description="Education background extracted from your CV."
              icon={GraduationCap}
              title="Education"
            />
            {education.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {education.map((item, idx) => (
                  <div className="rounded-lg bg-ink-50 p-4" key={idx}>
                    <h3 className="font-bold text-ink-900">{item.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-primary-700">
                      {item.provider}
                    </p>
                    {item.detail && (
                      <p className="mt-3 text-sm leading-6 text-ink-500">
                        {item.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No education history found in CV.</p>
            )}
          </Card>
        )}

        {activeTab === "Certifications" && (
          <Card>
            <SectionHeading
              description="Certificates and learning credentials extracted from your CV."
              icon={Award}
              title="Certifications"
            />
            {certifications.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {certifications.map((certification, idx) => (
                  <div
                    className="flex min-h-20 items-center gap-3 rounded-lg bg-ink-50 p-4"
                    key={idx}
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-bold text-ink-800 line-clamp-2">
                      {typeof certification === "string" ? certification : certification?.name || "Unknown"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No certifications found in CV.</p>
            )}
          </Card>
        )}
      </section>

      {activeTab !== "Education" && activeTab !== "Certifications" && (
        <section className="profile-lower-wallpaper -mx-4 px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 animate-fade-in-slide-up" key={`lower-${activeTab}`}>
          <div className="space-y-6">
            
            {activeTab === "Overview" && projects.length > 0 && (
              <Card>
                <SectionHeading
                  description="Projects that strengthen your employability story."
                  icon={BriefcaseBusiness}
                  title="Portfolio Highlights"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {projects.map((project, idx) => (
                    <div className="rounded-lg border border-ink-100 p-4" key={idx}>
                      <h3 className="font-bold text-ink-900">{project.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-ink-500">
                        {project.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "Career Goal" && careerMatches.length > 0 && (
              <Card>
                <SectionHeading
                  description="AI-assisted career guidance based on your profile direction."
                  icon={Sparkles}
                  title="Alternative Career Paths"
                />
                <div className="grid gap-4 md:grid-cols-3">
                  {careerMatches.map((match, idx) => (
                    <div className="rounded-lg bg-primary-50 p-4" key={idx}>
                      <Sparkles className="h-5 w-5 text-primary-600" />
                      <p className="mt-3 text-sm font-semibold leading-6 text-primary-900">
                        {match.role}
                      </p>
                      <p className="mt-1 text-xs font-bold text-primary-700">Match: {match.matchPercentage}%</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "Skills" && missingSkills.length > 0 && (
              <Card>
                <SectionHeading
                  description="A deeper view of your current skill gaps for your target role."
                  icon={ChartNoAxesCombined}
                  title="Skill Gap Analysis"
                />
                <div className="grid gap-5 md:grid-cols-[0.45fr_1fr]">
                  <div className="rounded-lg bg-primary-50 p-6 text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary-700">
                      Target Role Match
                    </p>
                    <p className="mt-3 text-5xl font-black text-primary-600">
                      {skillScore}%
                    </p>
                    <p className="mt-3 text-sm leading-6 text-primary-800">
                      Your CV score is {analysis?.cvScore}%. Fill your skill gaps to improve your match confidence.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {missingSkills.map((gap, idx) => (
                      <div className="rounded-lg border border-ink-100 p-4" key={idx}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-bold text-ink-800">
                            {typeof gap === "string" ? gap : gap.skill}
                          </span>
                          {typeof gap !== "string" && gap.required && (
                            <span className="text-ink-500">
                              {gap.current}% / {gap.required}%
                            </span>
                          )}
                        </div>
                        {typeof gap !== "string" && gap.required && (
                          <ProgressBar value={gap.current} />
                        )}
                        {typeof gap !== "string" && gap.recommendation && (
                          <p className="mt-2 text-xs text-ink-500">{gap.recommendation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
