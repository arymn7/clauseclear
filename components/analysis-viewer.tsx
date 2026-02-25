"use client";

import type { AnalysisResult } from "../types/analysis";

type AnalysisViewerProps = {
  analysis: AnalysisResult;
  createdAt?: string | null;
  fileName?: string;
};

function formatTimestamp(ts?: string | null) {
  if (!ts) {
    return "Unknown";
  }

  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</h3>
      <div className="h-px w-full bg-[var(--border-subtle)]" />
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">None listed.</p>;
  }

  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--text-secondary)]">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export default function AnalysisViewer({ analysis, createdAt, fileName = "Contract" }: AnalysisViewerProps) {
  return (
    <article className="px-6 py-7 transition-opacity duration-150 sm:px-8">
      <header className="mb-8 space-y-3 border-b border-[var(--border-subtle)] pb-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-secondary)]">Analysis report</p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{fileName}</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="rounded-full bg-[var(--section-tint)] px-2.5 py-1">AI-assisted summary</span>
          <span className="rounded-full bg-[var(--section-tint)] px-2.5 py-1">Last analyzed: {formatTimestamp(createdAt)}</span>
          <span className="rounded-full bg-[var(--section-tint)] px-2.5 py-1">Review before relying legally.</span>
        </div>
      </header>

      <div className="space-y-10">
        <section className="space-y-4">
          <SectionTitle title="Summary" />
          <p className="text-sm leading-8 text-[var(--text-secondary)]">{analysis.summary || "No summary available."}</p>
        </section>

        <section className="space-y-4">
          <SectionTitle title="Risks" />
          <BulletList items={analysis.risks} />
        </section>

        <section className="space-y-4">
          <SectionTitle title="Obligations" />
          <BulletList items={analysis.obligations} />
        </section>

        <section className="space-y-4">
          <SectionTitle title="Red Flags" />
          {analysis.red_flags.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">None listed.</p>
          ) : (
            <ul className="space-y-2.5">
              {analysis.red_flags.map((flag, index) => (
                <li
                  key={`${flag}-${index}`}
                  className="rounded-lg border border-[#e5d8d1] bg-[#f9f1ed] px-3 py-2 text-sm leading-6 text-[#7b4033]"
                >
                  {flag}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <SectionTitle title="Key Clauses" />
          {analysis.section_summaries.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No section summaries available.</p>
          ) : (
            <div className="space-y-5">
              {analysis.section_summaries.map((section, index) => (
                <div key={`${section.section}-${index}`} className="space-y-1.5">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">{section.section}</h4>
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">{section.summary}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </article>
  );
}

