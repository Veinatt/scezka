/**
 * Trim and strip a single pair of surrounding quotes (common .env paste mistakes).
 */
function normalizeEnvValue(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  let v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

/**
 * Parsed, validated Supabase browser-safe env. Returns null if URL/key are missing or invalid.
 */
export function getSupabaseEnv(): SupabasePublicEnv | null {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !anonKey) {
    return null;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return { url, anonKey };
  } catch {
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
