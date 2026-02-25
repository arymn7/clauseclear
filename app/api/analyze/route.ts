export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";
import { extractTextFromPdf } from "../../../lib/pdf-extract";
import { analyzeContractText } from "../../../lib/gemini-analyze";
import type { AnalyzeResponse } from "../../../types/analysis";

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!isPdfFile(file)) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const pdfBytes = Buffer.from(await file.arrayBuffer());
    const contractText = await extractTextFromPdf(pdfBytes);
    const analysis = await analyzeContractText(contractText);

    const response: AnalyzeResponse = {
      file_name: file.name,
      analysis,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
