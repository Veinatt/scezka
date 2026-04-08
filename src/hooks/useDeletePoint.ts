'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { pointsQueryKeys } from '@/hooks/usePoints';

export type DeletePointInput = {
  id: string;
  userId: string;
};

export function useDeletePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeletePointInput) => {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }

      const { error } = await supabase.from('points').delete().eq('id', id);

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
