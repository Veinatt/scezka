'use client';

import { useMemo } from 'react';
import { YMaps, Map as YandexMap, Placemark } from '@pbe/react-yandex-maps';
import { AlertCircle } from 'lucide-react';

import type { PointWithCoords } from '@/hooks/usePoints';

type DashboardUserMapProps = {
  points: PointWithCoords[];
};

const DEFAULT_CENTER: [number, number] = [53.7098, 27.9534];
const DEFAULT_ZOOM = 6;

function centerAndZoomFor(points: PointWithCoords[]): { center: [number, number]; zoom: number } {
  if (points.length === 0) {
    return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
  }
  if (points.length === 1) {
    return { center: [points[0].lat, points[0].lng], zoom: 11 };
  }
  const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  return { center: [lat, lng], zoom: 8 };
}

export function DashboardUserMap({ points }: DashboardUserMapProps) {
  const yandexApiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  const mapState = useMemo(() => {
    const { center, zoom } = centerAndZoomFor(points);
    return {
      center,
      zoom,
      controls: ['zoomControl', 'fullscreenControl'],
    };
  }, [points]);

  return (
    <div className="flex h-full min-h-[320px] flex-col gap-2 lg:min-h-0">
      <div className="flex items-center justify-end">
        {!yandexApiKey ? (
          <div className="inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-xs text-muted-foreground">
            <AlertCircle className="size-3.5" />
            Set NEXT_PUBLIC_YANDEX_MAPS_API_KEY
          </div>
        ) : null}
      </div>

      <div className="min-h-[320px] flex-1 overflow-hidden rounded-xl border bg-muted/20 lg:min-h-[420px]">
        <YMaps
          query={yandexApiKey ? { apikey: yandexApiKey, load: 'package.full' } : { load: 'package.full' }}
        >
          <YandexMap
            key={`${mapState.center[0]}-${mapState.center[1]}-${points.length}`}
            defaultState={mapState}
            width="100%"
            height="100%"
          >
            {points.map((point) => (
              <Placemark
                key={point.id}
                geometry={[point.lat, point.lng]}
                modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                properties={{
                  hintContent: point.title,
                  balloonContentHeader: point.title,
                  balloonContentBody: `${point.description ?? 'No description.'}${point.region ? ` · ${point.region}` : ''}`,
                }}
              />
            ))}
          </YandexMap>
        </YMaps>
      </div>
    </div>
  );
}
