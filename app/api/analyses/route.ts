import { NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";
import type { AnalysisHistoryItem } from "../../../types/analysis";

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

    return NextResponse.json({ analyses: (data ?? []) as AnalysisHistoryItem[] });
  } catch {
    return NextResponse.json({ error: "Failed to load analyses" }, { status: 500 });
  }
}
