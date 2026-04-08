'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { pointsQueryKeys } from '@/hooks/usePoints';

export type UpdatePointInput = {
  id: string;
  /** Current user id — used to invalidate `useUserPoints` cache */
  userId: string;
  title: string;
  description: string | null;
  region: string | null;
  lat: number;
  lng: number;
};

export function useUpdatePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePointInput) => {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }

      const { error } = await supabase
        .from('points')
        .update({
          title: input.title,
          description: input.description,
          region: input.region,
          location: `SRID=4326;POINT(${input.lng} ${input.lat})`,
        })
        .eq('id', input.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: pointsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: pointsQueryKeys.user(variables.userId) });
    },
  });
}
