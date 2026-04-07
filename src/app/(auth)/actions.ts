'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const email = String(formData.get('email'));
  const password = String(formData.get('password'));

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const email = String(formData.get('email'));
  const password = String(formData.get('password'));

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The trigger auto-creates a profile; email confirmation is handled by Supabase.
      emailRedirectTo: `${(await headers()).get('origin')}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: 'Check your email to confirm your account before signing in.',
  };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  if (!supabase) {
    return { error: 'Supabase is not configured.' };
  }

  const origin = (await headers()).get('origin') ?? '';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: 'Could not start Google sign-in.' };
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect('/');
}
