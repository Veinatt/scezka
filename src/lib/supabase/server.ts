import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from './database.types';
import { getSupabaseEnv } from './env';

export async function createClient(): Promise<SupabaseClient<Database> | null> {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    return createServerClient<Database>(env.url, env.anonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    });
  } catch {
    return null;
  }
}
