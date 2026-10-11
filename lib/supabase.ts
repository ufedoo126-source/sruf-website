import { createClient } from "@supabase/supabase-js";

// This is the "browser-safe" connection. It uses the anon key, so it can only
// do what your Row Level Security policies allow (e.g. read products).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);