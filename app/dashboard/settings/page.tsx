import SettingsPanel from "../../../components/settings-panel";
import TopNav from "../../../components/top-nav";
import { createClient } from "../../../lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      <TopNav userEmail={user.email} active="settings" />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Settings
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            Manage your workspace preferences and account controls.
          </p>
        </header>

        <section className="mt-8">
          <SettingsPanel email={user.email ?? ""} />
        </section>
      </div>
    </main>
  );
}
