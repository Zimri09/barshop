import { createClient } from "@supabase/supabase-js";

// Server-side anon client (respects RLS when given a user JWT)
export const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
