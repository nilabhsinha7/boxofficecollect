import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

export function getSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
