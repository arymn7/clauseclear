"use client";

import { useState } from "react";
import type { AnalyzeResponse } from "../types/analysis";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError("Select a PDF file.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type") ?? "";
      let data: AnalyzeResponse | { error: string } | null = null;

      if (contentType.includes("application/json")) {
        data = (await response.json()) as AnalyzeResponse | { error: string };
      } else {
        const text = (await response.text()).trim();
        data = { error: text || `Request failed with status ${response.status}` };
      }

      if (!response.ok) {
        const message =
          data && "error" in data ? data.error : `Request failed with status ${response.status}`;
        setError(message);
        return;
      }

      setResult(data as AnalyzeResponse);
    } catch {
      setError("Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2>Upload Contract PDF</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload and Analyze"}
        </button>
      </form>
      {error ? <p>{error}</p> : null}
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : null}
    </section>
  );
}
