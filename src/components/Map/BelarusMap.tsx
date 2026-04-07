'use client';

import { useMemo, useState } from 'react';
import { YMaps, Map as YandexMap, Placemark } from '@pbe/react-yandex-maps';
import { AlertCircle } from 'lucide-react';
import { AddPointDialog } from '@/components/Map/AddPointDialog';
import { useCreatePoint, usePoints } from '@/hooks/usePoints';

type BelarusMapProps = {
  userId: string | null;
};

const BELARUS_CENTER: [number, number] = [53.7098, 27.9534];
const BELARUS_ZOOM = 6;

export function BelarusMap({ userId }: BelarusMapProps) {
  const { data: points = [], isLoading, isError, error } = usePoints();
  const createPoint = useCreatePoint();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  const yandexApiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  const mapState = useMemo(
    () => ({
      center: BELARUS_CENTER,
      zoom: BELARUS_ZOOM,
      controls: ['zoomControl', 'fullscreenControl'],
    }),
    []
  );

  function handleMapClick(event: unknown) {
    const maybeEvent = event as { get?: (key: string) => unknown };
    const coords = maybeEvent.get?.('coords') as [number, number] | undefined;
    if (!coords) return;
    setSelectedCoords({ latitude: coords[0], longitude: coords[1] });
    setDialogOpen(true);
  }

  async function handleCreate(payload: { title: string; description: string; region: string }) {
    if (!selectedCoords || !userId) {
      throw new Error('You must be signed in and choose a location.');
    }

    await createPoint.mutateAsync({
      title: payload.title,
      description: payload.description,
      region: payload.region,
      latitude: selectedCoords.latitude,
      longitude: selectedCoords.longitude,
      userId,
    });
  }

  return (
    <section className="mt-8 w-full max-w-5xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {userId
            ? 'Click anywhere on the map to add a new point.'
            : 'Browse points freely. Sign in to add your own locations.'}
        </p>
        {!yandexApiKey ? (
          <div className="inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-xs text-muted-foreground">
            <AlertCircle className="size-3.5" />
            Set NEXT_PUBLIC_YANDEX_MAPS_API_KEY
          </div>
        ) : null}
      </div>

      <div className="h-[520px] overflow-hidden rounded-xl border bg-muted/20">
        <YMaps query={yandexApiKey ? { apikey: yandexApiKey, load: 'package.full' } : { load: 'package.full' }}>
          <YandexMap defaultState={mapState} width="100%" height="100%" onClick={handleMapClick}>
            {points.map((point) => (
              <Placemark
                key={point.id}
                geometry={[point.latitude, point.longitude]}
                modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                properties={{
                  hintContent: point.title,
                  balloonContentHeader: point.title,
                  balloonContentBody: point.description ?? 'No description yet.',
                }}
              />
            ))}
          </YandexMap>
        </YMaps>
      </div>

      {isLoading ? <p className="mt-2 text-sm text-muted-foreground">Loading points...</p> : null}
      {isError ? (
        <p className="mt-2 text-sm text-destructive">
          Failed to load points: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      ) : null}
      {!isLoading && !isError && points.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No points yet. Be the first to add one.
        </p>
      ) : null}

      <AddPointDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        latitude={selectedCoords?.latitude ?? null}
        longitude={selectedCoords?.longitude ?? null}
        canCreate={Boolean(userId)}
        isSaving={createPoint.isPending}
        onSubmit={handleCreate}
      />
    </section>
  );
}
