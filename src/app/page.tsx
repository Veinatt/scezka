import { createClient } from '@/lib/supabase/server';
import { HomeMap } from '@/components/Map/HomeMap';

export default async function Home() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-center">ściežka</h1>
      <p className="mt-4 text-lg text-center max-w-2xl">
        Social travel map for Belarus – mark your routes, share points, and discover new paths.
      </p>
      <p className="mt-2 text-muted-foreground">
        {user
          ? `Welcome back, ${user.email}!`
          : supabase
            ? 'Please sign in to start adding points.'
            : 'Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable auth.'}
      </p>
      <HomeMap userId={user?.id ?? null} />
    </main>
  );
}
