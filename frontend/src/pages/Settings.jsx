import { Bell, BriefcaseBusiness, Lock, Mail, Save, ShieldCheck, User } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import FormField from "../components/ui/FormField.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import useAuth from "../hooks/useAuth.js";

const preferenceGroups = [
  {
    title: "Recommendation preferences",
    description: "Control how SkillNova prioritizes course and job suggestions.",
    icon: BriefcaseBusiness,
    items: [
      "Email course recommendations",
      "Show remote jobs first",
      "Use CV data for match scoring",
      "Prioritize beginner-friendly learning paths",
    ],
  },
  {
    title: "Notification preferences",
    description: "Choose the reminders that help you keep steady progress.",
    icon: Bell,
    items: [
      "Weekly progress reminders",
      "New job match alerts",
      "Skill test availability alerts",
      "Course completion reminders",
    ],
  },
];

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <PageHeader
        action={<Button icon={Save}>Save changes</Button>}
        description="Manage profile, recommendations, notifications, and account preferences in one clean flow."
        eyebrow="Settings"
        title="Personalize your career profile"
      />

      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-900">Profile details</h2>
            <p className="text-sm leading-6 text-ink-500">
              Keep the information used for your recommendations up to date.
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" defaultValue={user?.name ?? ""} />
          <FormField label="Email" defaultValue={user?.email ?? ""} type="email" />
          <FormField
            label="Target role"
            defaultValue={user?.targetRole ?? "Junior React Developer"}
          />
          <FormField label="Location" defaultValue="Colombo, Sri Lanka" />
          <FormField
            className="sm:col-span-2"
            label="Career summary"
            defaultValue={
              user?.experience ??
              "Final year software engineering student focused on frontend development, UI systems, and practical project work."
            }
            rows="5"
            textarea
          />
        </form>
      </Card>

      <section className="settings-lower-wallpaper -mx-4 px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="space-y-8">
          {preferenceGroups.map(({ description, icon: Icon, items, title }) => (
            <Card key={title}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink-900">{title}</h2>
                  <p className="text-sm leading-6 text-ink-500">{description}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {items.map((item, index) => (
                  <label
                    className="flex min-h-16 items-center justify-between gap-4 rounded-lg bg-ink-50 p-4"
                    key={item}
                  >
                    <span className="text-sm font-semibold text-ink-700">
                      {item}
                    </span>
                    <input
                      className="h-5 w-5 rounded border-ink-200 text-primary-500 focus:ring-primary-400"
                      defaultChecked={index !== 3}
                      type="checkbox"
                    />
                  </label>
                ))}
              </div>
            </Card>
          ))}

          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink-900">
                  Privacy and analysis
                </h2>
                <p className="text-sm leading-6 text-ink-500">
                  Choose how SkillNova uses your uploaded CV and learning data.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "CV analysis storage",
                  description:
                    "Keep the latest simulated CV analysis available after refresh.",
                },
                {
                  title: "Personalized recommendations",
                  description:
                    "Use target role, skills, and progress to improve suggestions.",
                },
                {
                  title: "Progress visibility",
                  description:
                    "Show learning progress throughout dashboard and profile pages.",
                },
                {
                  title: "Account activity",
                  description:
                    "Display recent activity to help track your career workflow.",
                },
              ].map((item) => (
                <div className="rounded-lg border border-ink-100 bg-white p-4" key={item.title}>
                  <h3 className="font-bold text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink-900">
                    Account security
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">
                    Student authentication is stored locally for this prototype.
                    Backend authentication can replace this flow later.
                  </p>
                </div>
              </div>
              <Button variant="secondary">Review security</Button>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink-900">
                    Communication settings
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">
                    Choose how SkillNova contacts you about course updates, CV
                    review changes, and job recommendation improvements.
                  </p>
                </div>
              </div>
              <Button variant="secondary">Manage email</Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
