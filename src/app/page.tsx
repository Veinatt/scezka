import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-center">Scežka</h1>
      <p className="mt-4 text-lg text-center max-w-2xl">
        Social travel map for Belarus – mark your routes, share points, and discover new paths.
      </p>
      <p className="mt-2 text-muted-foreground">
        {user ? `Welcome back, ${user.email}!` : 'Please sign in to start adding points.'}
      </p>
      <div className="mt-8 h-96 w-full max-w-4xl bg-gray-200 rounded-lg flex items-center justify-center">
        🗺️ Yandex Maps will be displayed here
      </div>
    </main>
  );
}
