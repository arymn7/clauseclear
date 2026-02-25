"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalyzeResponse } from "../types/analysis";

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const handleFileSelection = (nextFile: File | null) => {
    if (!nextFile) {
      return;
    }

    if (!isPdf(nextFile)) {
      setError("Only PDF files are supported.");
      return;
    }

    setFile(nextFile);
    setError(null);
  };

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
      router.refresh();
    } catch {
      setError("Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel)] p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
        />

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const droppedFile = event.dataTransfer.files?.[0] ?? null;
            handleFileSelection(droppedFile);
          }}
          className={`rounded-xl border border-dashed px-6 py-12 text-center transition-colors duration-150 ${
            isDragging
              ? "border-[var(--accent)] bg-[var(--accent-soft)]"
              : "border-[var(--border-subtle)] bg-[var(--panel)] hover:bg-[var(--section-tint)]"
          }`}
        >
          <p className="text-lg font-medium text-[var(--text-primary)]">Drop a contract here</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">or upload a PDF</p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--section-tint)] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
            <LockIcon />
            <span>Your documents stay private.</span>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--panel)] px-3 text-sm text-[var(--text-secondary)] transition-colors duration-150 hover:bg-[var(--section-tint)]"
            >
              Choose PDF
            </button>
          </div>

          {file ? <p className="mt-4 text-sm font-medium text-[var(--accent)]">Selected: {file.name}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Analyzing..." : "Analyze contract"}
          </button>

          <span className="text-xs text-[var(--text-muted)]">AI-assisted output. Review before relying legally.</span>
        </div>
      </form>

      {isSubmitting ? (
        <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--panel)] p-4">
          <div className="analysis-loader">
            <div className="analysis-book" aria-hidden="true">
              <div className="analysis-book-base" />
              <div className="analysis-book-page" />
              <div className="analysis-book-page two" />
            </div>
            <div className="analysis-magnifier" aria-hidden="true" />
            <p className="text-sm text-[var(--text-secondary)]">Reading clauses and generating structured analysis...</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-lg border border-[#e8cdc8] bg-[#fbefec] px-3 py-2 text-sm text-[#8e3b2f]">{error}</div>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-opacity duration-150">
          Analysis completed for <span className="font-medium text-[var(--text-primary)]">{result.file_name}</span>.
        </div>
      ) : null}
    </section>
  );
}
