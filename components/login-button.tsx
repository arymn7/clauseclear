"use client";

import { createClient } from "../lib/supabase/client";

type LoginButtonProps = {
  className?: string;
  label?: string;
};

export default function LoginButton({ className, label = "Sign in" }: LoginButtonProps) {
  const handleLogin = async () => {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  };

  return (
    <button
      type="button"
      onClick={() => void handleLogin()}
      className={`inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${
        className ?? ""
      }`}
    >
      {label}
    </button>
  );
}
