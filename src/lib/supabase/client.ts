import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { getSupabaseEnv } from './env';

export function createClient(): SupabaseClient<Database> | null {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }
  try {
    return createBrowserClient<Database>(env.url, env.anonKey);
  } catch {
    return null;
  }
}
