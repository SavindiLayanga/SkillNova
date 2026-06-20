import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="premium-wallpaper min-h-screen bg-ink-50">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </section>
        <section className="hidden bg-primary-500 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-black text-primary-600">
              S
            </div>
            <div>
              <p className="text-lg font-bold">SkillNova</p>
              <p className="text-sm text-primary-100">Career growth cockpit</p>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-100">
              Learn smarter
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight xl:text-5xl">
              Turn every CV into a focused career roadmap.
            </h1>
            <p className="mt-5 text-lg leading-8 text-primary-50">
              Upload your profile, discover skill gaps, follow course paths, and
              match with jobs that fit where you want to go next.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {["CV Analysis", "Course Matching", "Progress Tracking"].map(
              (item) => (
                <div
                  className="rounded-lg bg-white/15 p-4 font-semibold backdrop-blur"
                  key={item}
                >
                  {item}
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
