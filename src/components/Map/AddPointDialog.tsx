'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type AddPointDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number | null;
  longitude: number | null;
  canCreate: boolean;
  isSaving: boolean;
  onSubmit: (payload: { title: string; description: string; region: string }) => Promise<void>;
};

export function AddPointDialog({
  open,
  onOpenChange,
  latitude,
  longitude,
  canCreate,
  isSaving,
  onSubmit,
}: AddPointDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    setError(null);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), region: region.trim() });
      setTitle('');
      setDescription('');
      setRegion('');
      onOpenChange(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create point.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new point</DialogTitle>
          <DialogDescription>
            {latitude !== null && longitude !== null
              ? `Selected location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
              : 'Select a location on the map first.'}
          </DialogDescription>
        </DialogHeader>

        {!canCreate ? (
          <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            Sign in to add points. You can still browse existing markers.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="point-title">Title</Label>
              <Input
                id="point-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Mir Castle"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="point-description">Description</Label>
              <Textarea
                id="point-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short travel note..."
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="point-region">Region (optional)</Label>
              <Input
                id="point-region"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="e.g. Minsk Region"
              />
            </div>
          </div>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canCreate || latitude === null || longitude === null || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save point'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
