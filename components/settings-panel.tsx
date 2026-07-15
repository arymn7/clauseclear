"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "../lib/supabase/client";

type SettingsPanelProps = {
  email: string;
};

const SETTINGS_STORAGE_KEY = "clauseclear-preferences";

type StoredPreferences = {
  displayName: string;
  tone: string;
  showRiskPriority: boolean;
  privacyNotice: boolean;
};

function getDefaultPreferences(email: string): StoredPreferences {
  return {
    displayName: email.split("@")[0] || "Workspace User",
    tone: "balanced",
    showRiskPriority: true,
    privacyNotice: true,
  };
}

function readStoredPreferences(email: string): StoredPreferences {
  const fallback = getDefaultPreferences(email);

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!stored) {
      return fallback;
    }

    const preferences = JSON.parse(stored) as Partial<StoredPreferences>;

    return {
      displayName:
        typeof preferences.displayName === "string" && preferences.displayName.trim()
          ? preferences.displayName
          : fallback.displayName,
      tone:
        preferences.tone === "risk-first" || preferences.tone === "obligations-first"
          ? preferences.tone
          : fallback.tone,
      showRiskPriority:
        typeof preferences.showRiskPriority === "boolean"
          ? preferences.showRiskPriority
          : fallback.showRiskPriority,
      privacyNotice:
        typeof preferences.privacyNotice === "boolean"
          ? preferences.privacyNotice
          : fallback.privacyNotice,
    };
  } catch {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    return fallback;
  }
}

function subscribeToHydration() {
  return () => {};
}

function getClientHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

function SettingsEditor({ email }: SettingsPanelProps) {
  const router = useRouter();
  const initialPreferences = readStoredPreferences(email);

  const [displayName, setDisplayName] = useState(initialPreferences.displayName);
  const [tone, setTone] = useState(initialPreferences.tone);
  const [showRiskPriority, setShowRiskPriority] = useState(initialPreferences.showRiskPriority);
  const [privacyNotice, setPrivacyNotice] = useState(initialPreferences.privacyNotice);
  const [message, setMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const preferences: StoredPreferences = {
      displayName: displayName.trim() || email.split("@")[0] || "Workspace User",
      tone,
      showRiskPriority,
      privacyNotice,
    };

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
    setDisplayName(preferences.displayName);
    setMessage("Preferences saved on this device.");
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
          Adjust your review defaults for a consistent legal workflow. These preferences are stored locally in your browser.
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

export default function SettingsPanel({ email }: SettingsPanelProps) {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydratedSnapshot,
    getServerHydratedSnapshot,
  );

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--panel)] p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Workspace Settings</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Loading your saved workspace preferences.
          </p>
        </section>
      </div>
    );
  }

  return <SettingsEditor email={email} />;
}
