import { DashboardView } from '@/components/Dashboard/DashboardView';
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

  const displayName = profile?.full_name ?? profile?.username ?? user.email ?? 'Traveler';

  return (
    <main className="container mx-auto max-w-6xl flex-1 px-4 py-10">
      <DashboardView userId={user.id} displayName={displayName} />
    </main>
  );
}
