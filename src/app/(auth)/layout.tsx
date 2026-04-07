import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ścieżka – Sign in',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      {children}
    </div>
  );
}
