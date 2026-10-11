"use client";

import { useSession, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { setAuthUser } from "@/lib/progress";
import { setSupabaseTokenGetter } from "@/lib/supabase";

/** Tells the progress store and the Supabase client who is signed in with Clerk. */
export function ClerkBridge() {
  const { isLoaded, user } = useUser();
  const { session } = useSession();

  useEffect(() => {
    setSupabaseTokenGetter(async () => (await session?.getToken()) ?? null);
  }, [session]);

  const id = user?.id ?? null;
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const name = user?.fullName?.trim() || null;
  const imageUrl = user?.imageUrl ?? null;
  useEffect(() => {
    if (!isLoaded) return;
    setAuthUser(id ? { id, email, name, imageUrl } : null);
  }, [isLoaded, id, email, name, imageUrl]);

  return null;
}
