import LoginButton from "../../components/login-button";
import TopNav from "../../components/top-nav";
import { createClient } from "../../lib/supabase/server";

export default async function PublicHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      <TopNav userEmail={user?.email ?? null} />

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="flex w-full flex-col gap-6">
          <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--section-tint)] p-8 lg:p-10">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                ClauseClear Workspace
              </p>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--text-primary)] lg:text-5xl">
                  Understand contracts in minutes.
                </h1>
                <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)]">
                  ClauseClear helps you review legal documents faster with structured AI analysis.
                </p>
              </div>
            </div>

            <div className="relative mt-10 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--panel)] p-6">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--accent-soft)]" />
              <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-[var(--section-tint)]" />
              <div className="relative space-y-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">Contract Reading Workspace</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Structured summaries, obligations, and risk flags in one focused view.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--panel)] p-8 shadow-[0_8px_24px_rgba(28,28,28,0.04)] lg:p-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Welcome back</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Sign in with your Google workspace account to continue.
              </p>
            </div>

            <div className="mt-6">
              <LoginButton label="Sign in with Google" />
            </div>

            <p className="mt-6 text-xs text-[var(--text-muted)]">Your contracts remain private and encrypted.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
