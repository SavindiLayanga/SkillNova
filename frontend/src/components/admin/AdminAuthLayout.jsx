import { Outlet } from "react-router-dom";

export default function AdminAuthLayout() {
  return (
    <main className="premium-wallpaper min-h-screen bg-ink-50">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </section>
        <section className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500 text-xl font-black text-white">
              S
            </div>
            <div>
              <p className="text-lg font-bold">SkillNova Admin</p>
              <p className="text-sm text-slate-400">Operations Console</p>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-400">
              Manage & Monitor
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight xl:text-5xl">
              Keep the SkillNova ecosystem running smoothly.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Oversee user accounts, manage course content, monitor skill tests,
              and configure platform settings from a secure centralized hub.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
            {["User Management", "Platform Analytics", "Security Controls"].map(
              (item) => (
                <div
                  className="rounded-lg bg-slate-800/50 p-4 font-semibold backdrop-blur border border-slate-700/50"
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
