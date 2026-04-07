import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome, {profile?.full_name ?? profile?.username ?? user.email}!
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">My points</p>
          <p className="mt-1 text-2xl font-semibold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">My routes</p>
          <p className="mt-1 text-2xl font-semibold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Followers</p>
          <p className="mt-1 text-2xl font-semibold">0</p>
        </div>
      </div>

      <div className="mt-10 rounded-lg border bg-card p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">Map coming soon</p>
        <p className="mt-1 text-sm">
          Stage 2 – Yandex Maps integration and point creation are next.
        </p>
      </div>
    </main>
  );
}
