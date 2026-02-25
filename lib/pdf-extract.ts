import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  buffer: Buffer | Uint8Array,
) => Promise<{ text: string }>;

export async function extractTextFromPdf(pdfBytes: Buffer): Promise<string> {
  if (!pdfBytes.length) {
    throw new Error("Uploaded PDF is empty.");
  }

  const result = await pdfParse(pdfBytes);
  const text = result.text.trim();

  if (!text) {
    throw new Error("Could not extract text from PDF.");
  }

  return text;
}
