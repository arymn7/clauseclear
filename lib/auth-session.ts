import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "./supabase/server";

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function requireSessionUser(): Promise<User> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/");
  }

  return user;
}
