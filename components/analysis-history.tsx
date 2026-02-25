"use client";

import { useMemo, useState } from "react";

import type { AnalysisHistoryItem, AnalysisResult } from "../types/analysis";
import AnalysisViewer from "./analysis-viewer";

type AnalysisHistoryProps = {
  analyses: AnalysisHistoryItem[];
};

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAnalysisPayload(item: AnalysisHistoryItem | null): AnalysisResult | null {
  if (!item) {
    return null;
  }

  const analysis = (item as unknown as { analysis?: AnalysisResult; analysis_json?: AnalysisResult })
    .analysis;
  const analysisJson = (
    item as unknown as { analysis?: AnalysisResult; analysis_json?: AnalysisResult }
  ).analysis_json;

  return analysis ?? analysisJson ?? null;
}

function EmptyState() {
  return (
    <div className="flex min-h-[340px] items-center justify-center px-6 py-12">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--section-tint)] text-[var(--text-secondary)]">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7 3h7l5 5v13H7z" />
            <path d="M14 3v5h5" />
          </svg>
        </div>
        <p className="mt-4 text-base font-medium text-[var(--text-primary)]">Upload your first contract to begin analysis.</p>
      </div>
    </div>
  );
}

export default function AnalysisHistory({ analyses }: AnalysisHistoryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(analyses[0]?.id ?? null);

  const selectedAnalysis = useMemo(
    () => analyses.find((item) => item.id === selectedId) ?? analyses[0] ?? null,
    [analyses, selectedId],
  );

  const selectedPayload = getAnalysisPayload(selectedAnalysis);

  if (analyses.length === 0) {
    return (
      <section className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--panel)]">
        <EmptyState />
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--panel)]">
      <div className="grid min-h-[560px] lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="border-b border-[var(--border-subtle)] bg-[var(--section-tint)]/65 lg:border-b-0 lg:border-r">
          <div className="border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Previous analyses</h2>
          </div>

          <ul className="max-h-[560px] overflow-y-auto">
            {analyses.map((analysis) => {
              const isSelected = selectedAnalysis?.id === analysis.id;

              return (
                <li key={analysis.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(analysis.id)}
                    className={`w-full border-b border-[var(--border-subtle)] px-5 py-4 text-left transition-colors duration-150 ${
                      isSelected
                        ? "bg-[var(--accent-soft)]"
                        : "bg-transparent hover:bg-[var(--panel)]/80"
                    }`}
                  >
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{analysis.file_name}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{formatTimestamp(analysis.created_at)}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="bg-[var(--panel)]">
          {selectedPayload ? (
            <AnalysisViewer
              analysis={selectedPayload}
              createdAt={selectedAnalysis?.created_at ?? null}
              fileName={selectedAnalysis?.file_name ?? "Contract"}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </section>
  );
}
