import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ofkpyrwvmjuqxvrxitpm.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ma3B5cnd2bWp1cXh2cnhpdHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjk0MDYsImV4cCI6MjA4OTgwNTQwNn0.m5pmOKuEUgXdJ_cc8JM6RYIpUV2A-nGB20rW_u-PT1o";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
