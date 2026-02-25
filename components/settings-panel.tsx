"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "../lib/supabase/client";

type SettingsPanelProps = {
  email: string;
};

export default function SettingsPanel({ email }: SettingsPanelProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(email.split("@")[0] || "");
  const [tone, setTone] = useState("balanced");
  const [showRiskPriority, setShowRiskPriority] = useState(true);
  const [privacyNotice, setPrivacyNotice] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Preferences saved for this session.");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Workspace Settings</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Adjust your review defaults for a consistent legal workflow.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSave}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Display name</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--panel)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors duration-150 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Default analysis emphasis</span>
            <select
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              className="h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--panel)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors duration-150 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            >
              <option value="balanced">Balanced overview</option>
              <option value="risk-first">Risk-first review</option>
              <option value="obligations-first">Obligations-first review</option>
            </select>
          </label>

          <div className="space-y-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--section-tint)] px-4 py-3">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-[var(--text-primary)]">Highlight critical risks first</span>
              <input
                type="checkbox"
                checked={showRiskPriority}
                onChange={(event) => setShowRiskPriority(event.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>

            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-[var(--text-primary)]">Show legal review reminder</span>
              <input
                type="checkbox"
                checked={privacyNotice}
                onChange={(event) => setPrivacyNotice(event.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--accent-hover)]"
          >
            Save settings
          </button>

          {message ? <p className="text-sm text-[var(--text-secondary)]">{message}</p> : null}
        </form>
      </section>

      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Account</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Signed in as {email}</p>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--panel)] px-4 text-sm text-[var(--text-primary)] transition-colors duration-150 hover:bg-[var(--section-tint)] disabled:opacity-70"
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
      </section>
    </div>
  );
}
