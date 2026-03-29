import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null | undefined;

/**
 * Returns a Supabase client when URL and anon key are set; otherwise null.
 * Lazy init avoids build-time failures when env vars are not present locally.
 */
export function getSupabase(): SupabaseClient | null {
  if (_client !== undefined) {
    return _client;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    _client = null;
    return null;
  }
  _client = createClient(url, key);
  return _client;
}
