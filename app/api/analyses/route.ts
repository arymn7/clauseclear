import { NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";
import type { AnalysisHistoryItem, AnalysisRecordRow } from "../../../types/analysis";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("contract_analyses")
      .select("id,user_id,file_name,contract_text,analysis_json,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to load analyses" }, { status: 500 });
    }

    const analyses: AnalysisHistoryItem[] = ((data ?? []) as AnalysisRecordRow[]).map((item) => ({
      id: item.id,
      user_id: item.user_id,
      file_name: item.file_name,
      analysis: item.analysis_json,
      created_at: item.created_at,
    }));

    return NextResponse.json({ analyses });
  } catch {
    return NextResponse.json({ error: "Failed to load analyses" }, { status: 500 });
  }
}
