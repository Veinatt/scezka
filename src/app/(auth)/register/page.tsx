'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthForm } from '@/components/Auth/AuthForm';
import { signUpWithEmail, signInWithGoogle } from '../actions';

export default function RegisterPage() {
  const [message, setMessage] = useState<string | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleEmail(formData: FormData) {
    const result = await signUpWithEmail(formData);
    if (result?.error) {
      setIsSuccess(false);
      setMessage(result.error);
    } else if (result?.success) {
      setIsSuccess(true);
      setMessage(result.success);
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
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Join Scežka and start sharing your journey</CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm
          mode="register"
          onEmailSubmit={handleEmail}
          onGoogleSignIn={handleGoogle}
          message={message}
          isSuccess={isSuccess}
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
