import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

/*
-------------------- References --------------------
Create Client - https://supabase.com/docs/guides/auth/quickstarts/nextjs
*/
