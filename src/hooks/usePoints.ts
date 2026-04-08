'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

type GeoJsonPoint = {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
};

export type PointWithCoords = {
  id: string;
  title: string;
  description: string | null;
  region: string | null;
  user_id: string;
  created_at: string;
  lng: number;
  lat: number;
};

export type CreatePointInput = {
  title: string;
  description?: string;
  region?: string;
  latitude: number;
  longitude: number;
  userId: string;
};

export const pointsQueryKeys = {
  all: ['points'] as const,
  user: (userId: string) => ['points', 'user', userId] as const,
};

function parseGeoJsonPoint(value: unknown): GeoJsonPoint | null {
  if (!value || typeof value !== 'object') return null;
  const maybe = value as { type?: unknown; coordinates?: unknown };
  if (maybe.type !== 'Point') return null;
  if (!Array.isArray(maybe.coordinates) || maybe.coordinates.length < 2) return null;

  const lng = Number(maybe.coordinates[0]);
  const lat = Number(maybe.coordinates[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  return { type: 'Point', coordinates: [lng, lat] };
}

function parseEwkbPointHex(value: string): GeoJsonPoint | null {
  const hex = value.trim();
  if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
  if (hex.length < 2 + 8 + 16 * 2) return null;

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const littleEndian = view.getUint8(0) === 1;

  const typeWithFlags = view.getUint32(1, littleEndian);
  const hasSrid = (typeWithFlags & 0x20000000) !== 0;
  const baseType = typeWithFlags & 0x000000ff;
  if (baseType !== 1) return null;

  let offset = 1 + 4;
  if (hasSrid) {
    offset += 4;
  }

  if (offset + 16 > view.byteLength) return null;

  const lng = view.getFloat64(offset, littleEndian);
  const lat = view.getFloat64(offset + 8, littleEndian);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

  return { type: 'Point', coordinates: [lng, lat] };
}

function parsePointLocation(value: unknown): GeoJsonPoint | null {
  const geo = parseGeoJsonPoint(value);
  if (geo) return geo;

  if (typeof value === 'string') {
    const ewkb = parseEwkbPointHex(value);
    if (ewkb) return ewkb;
  }

  return null;
}

function normalizePointRows(
  data: Array<{
    id: string;
    title: string;
    description: string | null;
    region: string | null;
    user_id: string;
    created_at: string;
    location: unknown;
  }> | null
): PointWithCoords[] {
  return (data ?? [])
    .map((item) => {
      const geo = parsePointLocation(item.location);
      if (!geo) return null;
      const [lng, lat] = geo.coordinates;
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        region: item.region,
        user_id: item.user_id,
        created_at: item.created_at,
        lng,
        lat,
      } satisfies PointWithCoords;
    })
    .filter((item): item is PointWithCoords => item !== null);
}

/** Loads points from Supabase; optionally filters by `userId` (for dashboard). */
export async function fetchPointsForClient(userId?: string | null): Promise<PointWithCoords[]> {
  const supabase = createClient();
  if (!supabase) {
    return [];
  }

  let query = supabase
    .from('points')
    .select('id, title, description, region, user_id, created_at, location')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return normalizePointRows(data);
}

export function usePoints() {
  return useQuery({
    queryKey: pointsQueryKeys.all,
    queryFn: () => fetchPointsForClient(),
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
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: pointsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: pointsQueryKeys.user(variables.userId) });
    },
  });
}
