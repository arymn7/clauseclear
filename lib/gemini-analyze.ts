import { GoogleGenAI, Type } from "@google/genai";

import type { AnalysisResult, SectionSummary } from "../types/analysis";

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    obligations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    red_flags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    section_summaries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          section: { type: Type.STRING },
          summary: { type: Type.STRING },
        },
        required: ["section", "summary"],
      },
    },
  },
  required: ["summary", "risks", "obligations", "red_flags", "section_summaries"],
};

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  return new GoogleGenAI({ apiKey });
}

function parseStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Invalid Gemini JSON field: ${field}`);
  }

  return value;
}

function parseSectionSummaries(value: unknown): SectionSummary[] {
  if (!Array.isArray(value)) {
    throw new Error("Invalid Gemini JSON field: section_summaries");
  }

  return value.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid Gemini JSON field: section_summaries");
    }

    const record = item as Record<string, unknown>;

    if (typeof record.section !== "string" || typeof record.summary !== "string") {
      throw new Error("Invalid Gemini JSON field: section_summaries");
    }

    return {
      section: record.section,
      summary: record.summary,
    };
  });
}

function parseAnalysisResult(rawJson: string): AnalysisResult {
  const parsed = JSON.parse(rawJson) as Record<string, unknown>;

  if (typeof parsed.summary !== "string") {
    throw new Error("Invalid Gemini JSON field: summary");
  }

  return {
    summary: parsed.summary,
    risks: parseStringArray(parsed.risks, "risks"),
    obligations: parseStringArray(parsed.obligations, "obligations"),
    red_flags: parseStringArray(parsed.red_flags, "red_flags"),
    section_summaries: parseSectionSummaries(parsed.section_summaries),
  };
}

export async function analyzeContractText(contractText: string): Promise<AnalysisResult> {
  const model = process.env.GEMINI_MODEL || "gemini-1.5-pro";
  const ai = createGeminiClient();

  const prompt = [
    "Analyze the following contract text.",
    "Return only valid JSON using this exact shape:",
    "{",
    '  "summary": "string",',
    '  "risks": ["string"],',
    '  "obligations": ["string"],',
    '  "red_flags": ["string"],',
    '  "section_summaries": [{"section": "string", "summary": "string"}]',
    "}",
    "Do not include markdown or extra keys.",
    "",
    "Contract:",
    contractText,
  ].join("\n");

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      temperature: 0.1,
    },
  });

  const responseText = response.text;

  if (!responseText) {
    throw new Error("Gemini returned an empty response.");
  }

  return parseAnalysisResult(responseText);
}
