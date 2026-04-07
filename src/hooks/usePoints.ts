'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export type PointMarker = {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  latitude: number;
  longitude: number;
};

export type CreatePointInput = {
  title: string;
  description?: string;
  region?: string;
  latitude: number;
  longitude: number;
  userId: string;
};

function parseCoordinates(location: unknown): { latitude: number; longitude: number } | null {
  if (!location) return null;

  // GeoJSON-like object: { type: 'Point', coordinates: [lng, lat] }
  if (typeof location === 'object' && location !== null && 'coordinates' in location) {
    const coords = (location as { coordinates?: unknown }).coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      const longitude = Number(coords[0]);
      const latitude = Number(coords[1]);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        return { latitude, longitude };
      }
    }
  }

  // WKT-like string: POINT(lng lat) or SRID=4326;POINT(lng lat)
  if (typeof location === 'string') {
    const match = location.match(/POINT\((-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\)/i);
    if (match) {
      const longitude = Number(match[1]);
      const latitude = Number(match[2]);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        return { latitude, longitude };
      }
    }
  }

  return null;
}

export function usePoints() {
  return useQuery({
    queryKey: ['points'],
    queryFn: async (): Promise<PointMarker[]> => {
      const supabase = createClient();
      if (!supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from('points')
        .select('id, title, description, user_id, created_at, location')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? [])
        .map((item) => {
          const coords = parseCoordinates(item.location);
          if (!coords) return null;
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            user_id: item.user_id,
            created_at: item.created_at,
            latitude: coords.latitude,
            longitude: coords.longitude,
          } satisfies PointMarker;
        })
        .filter((item): item is PointMarker => item !== null);
    },
  });
}

export function useCreatePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePointInput) => {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }

      const { error } = await supabase.from('points').insert({
        title: input.title,
        description: input.description ?? null,
        region: input.region ?? null,
        user_id: input.userId,
        location: `SRID=4326;POINT(${input.longitude} ${input.latitude})`,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['points'] });
    },
  });
}
