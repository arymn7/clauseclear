import AnalysisHistory from "../../../components/analysis-history";
import TopNav from "../../../components/top-nav";
import { createClient } from "../../../lib/supabase/server";
import type { AnalysisHistoryItem } from "../../../types/analysis";

export default async function AnalysesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const { data } = await supabase
    .from("analyses")
    .select("id,user_id,file_name,analysis,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const analyses: AnalysisHistoryItem[] = data ?? [];

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      <TopNav userEmail={user.email} active="analyses" />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Analyses
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            Review previously analyzed contracts in a focused legal workspace.
          </p>
        </header>

        <section className="mt-8">
          <AnalysisHistory analyses={analyses} />
        </section>
      </div>
    </main>
  );
}
