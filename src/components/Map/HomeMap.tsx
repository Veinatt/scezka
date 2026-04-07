'use client';

import dynamic from 'next/dynamic';

const BelarusMap = dynamic(
  () => import('@/components/Map/BelarusMap').then((module) => module.BelarusMap),
  {
    ssr: false,
    loading: () => (
      <div className="mt-8 h-[520px] w-full max-w-5xl animate-pulse rounded-xl border bg-muted/30" />
    ),
  }
);

export function HomeMap({ userId }: { userId: string | null }) {
  return <BelarusMap userId={userId} />;
}
