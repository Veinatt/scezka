import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { getSupabaseEnv } from '@/lib/supabase/env';

/** Routes that require an authenticated session. */
const PROTECTED_PREFIXES = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const env = getSupabaseEnv();
  if (!env) {
    return response;
  }

  try {
    const supabase = createServerClient(env.url, env.anonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (isProtected && !user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // Never fail a request due to auth errors.
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
