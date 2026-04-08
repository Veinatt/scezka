'use client';

import dynamic from 'next/dynamic';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { EditPointDialog } from '@/components/EditPointDialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeletePoint } from '@/hooks/useDeletePoint';
import type { PointWithCoords } from '@/hooks/usePoints';
import { useUserPoints } from '@/hooks/useUserPoints';

const DashboardUserMap = dynamic(
  () =>
    import('@/components/Dashboard/DashboardUserMap').then((module) => module.DashboardUserMap),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[320px] flex-1 animate-pulse rounded-xl border bg-muted/30 lg:min-h-[420px]" />
    ),
  }
);

type DashboardViewProps = {
  userId: string;
  displayName: string;
};

function formatCreatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function DashboardView({ userId, displayName }: DashboardViewProps) {
  const { data: points = [], isLoading, isError, error } = useUserPoints(userId);
  const deletePoint = useDeletePoint();

  const [editingPoint, setEditingPoint] = useState<PointWithCoords | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PointWithCoords | null>(null);

  function openEdit(point: PointWithCoords) {
    setEditingPoint(point);
    setEditOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deletePoint.mutateAsync({ id: deleteTarget.id, userId });
      toast.success('Point deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete point');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome, {displayName}!</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My points</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{isLoading ? '…' : points.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>My routes</CardDescription>
            <CardTitle className="text-3xl tabular-nums">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Followers</CardDescription>
            <CardTitle className="text-3xl tabular-nums">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
        <section className="flex flex-1 flex-col gap-4 lg:max-w-xl lg:shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Your places</h2>
            <p className="text-sm text-muted-foreground">
              Edit details or remove a point. Changes sync to the homepage map after save.
            </p>
          </div>

          {isError ? (
            <p className="text-sm text-destructive">
              Failed to load points: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          ) : null}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your points…</p>
          ) : !isError && points.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  You have not added any points yet. Use the map on the home page to create one.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ul className="flex max-h-[720px] flex-col gap-3 overflow-y-auto pr-1">
              {points.map((point) => (
                <li key={point.id}>
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base leading-snug">{point.title}</CardTitle>
                      <CardDescription>
                        {formatCreatedAt(point.created_at)}
                        {point.region ? ` · ${point.region}` : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-2 text-sm">
                      <p className="text-muted-foreground">
                        {point.description?.trim() ? point.description : 'No description.'}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        lat {point.lat.toFixed(6)}, lng {point.lng.toFixed(6)}
                      </p>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-end gap-2 border-t bg-muted/30 pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(point)}
                        className="gap-1.5"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(point)}
                        className="gap-1.5"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex min-h-0 flex-1 flex-col lg:min-w-0">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Your map</h2>
            <p className="text-sm text-muted-foreground">
              Only your points are shown here. Pan and zoom are interactive.
            </p>
          </div>
          <DashboardUserMap points={points} />
        </section>
      </div>

      <EditPointDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingPoint(null);
        }}
        point={editingPoint}
        userId={userId}
      />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete this point?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `"${deleteTarget.title}" will be removed permanently. This cannot be undone.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton={false}>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deletePoint.isPending}
            >
              {deletePoint.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*
        RLS note: update/delete should be restricted to point owner in Supabase.
        If mutations fail with permission errors, check policies on `public.points`.
      */}
    </div>
  );
}
