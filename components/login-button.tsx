"use client";

import { createClient } from "../lib/supabase/client";

export default function LoginButton() {
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

  return <button onClick={() => void handleLogin()}>Continue with Google</button>;
}
