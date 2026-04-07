'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/Auth/AuthForm';
import { signInWithEmail, signInWithGoogle } from '../actions';

export default function LoginPage() {
  const [message, setMessage] = useState<string | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleEmail(formData: FormData) {
    const result = await signInWithEmail(formData);
    if (result?.error) {
      setIsSuccess(false);
      setMessage(result.error);
    }
  }

  async function handleGoogle() {
    const result = await signInWithGoogle();
    if (result?.error) {
      setMessage(result.error);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your ścieżka account</CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm
          mode="login"
          onEmailSubmit={handleEmail}
          onGoogleSignIn={handleGoogle}
          message={message}
          isSuccess={isSuccess}
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link href="/register" className="underline underline-offset-4 hover:text-foreground">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
