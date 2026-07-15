import AnalysisHistory from "../../components/analysis-history";
import TopNav from "../../components/top-nav";
import UploadForm from "../../components/upload-form";
import { createClient } from "../../lib/supabase/server";
import type { AnalysisHistoryItem, AnalysisRecordRow } from "../../types/analysis";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized");
  }

  const { data } = await supabase
    .from("contract_analyses")
    .select("id,user_id,file_name,contract_text,analysis_json,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const analyses: AnalysisHistoryItem[] = ((data ?? []) as AnalysisRecordRow[]).map((item) => ({
    id: item.id,
    user_id: item.user_id,
    file_name: item.file_name,
    analysis: item.analysis_json,
    created_at: item.created_at,
  }));

  return (
    <main className="min-h-screen bg-[var(--bg-main)]">
      <TopNav userEmail={user.email} active="dashboard" />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Contract Analysis
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
            Upload a contract to generate structured insights, risks, and obligations.
          </p>
        </header>

        <section className="mt-8">
          <UploadForm />
        </section>

        <section id="analyses" className="mt-10">
          <AnalysisHistory analyses={analyses} />
        </section>
      </div>
    </main>
  );
}
