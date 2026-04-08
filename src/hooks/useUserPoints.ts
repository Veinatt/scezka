'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPointsForClient, pointsQueryKeys, type PointWithCoords } from '@/hooks/usePoints';

export type { PointWithCoords };

/**
 * Points owned by a single user (RLS still applies: only your rows are readable).
 * Homepage uses `usePoints()` without a filter.
 */
export function useUserPoints(userId: string | null) {
  return useQuery({
    queryKey: userId ? pointsQueryKeys.user(userId) : ['points', 'user', '__none__'],
    queryFn: () => fetchPointsForClient(userId),
    enabled: Boolean(userId),
  });
}
