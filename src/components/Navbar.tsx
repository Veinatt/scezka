import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';

/**
 * Top navigation bar. Rendered as a server component so it can read the
 * session without a client-side fetch on every page.
 */
export async function Navbar() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Scežka
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <form action={signOut}>
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
