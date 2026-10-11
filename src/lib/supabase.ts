import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Sign-in is handled by Clerk. Supabase is set up to trust Clerk's session tokens
// ("Third-Party Auth" in the Supabase dashboard), so each request carries the Clerk token and
// row level security sees the Clerk user id as auth.jwt()->>'sub'.
let getToken: () => Promise<string | null> = async () => null;

/** Called by ClerkBridge so database requests are made as the signed-in Clerk user. */
export function setSupabaseTokenGetter(fn: () => Promise<string | null>) {
  getToken = fn;
}

/** Null when Supabase isn't configured; progress is then only kept in this browser. */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { accessToken: () => getToken() }) : null;
