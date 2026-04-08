'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { BELARUS_REGION_OPTIONS, belarusRegionSelectClassName } from '@/lib/belarusRegions';
import type { PointWithCoords } from '@/hooks/usePoints';
import { useUpdatePoint } from '@/hooks/useUpdatePoint';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

function numericField(min: number, max: number, label: string) {
  return z.preprocess((val) => {
    if (typeof val === 'number' && Number.isFinite(val)) return val;
    if (typeof val === 'string' && val.trim() !== '') return Number(val);
    return NaN;
  }, z.number().gte(min, `${label} is out of range`).lte(max, `${label} is out of range`));
}

const editPointSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  region: z.string().optional(),
  latitude: numericField(-90, 90, 'Latitude'),
  longitude: numericField(-180, 180, 'Longitude'),
});

type EditPointValuesIn = {
  title: string;
  description?: string;
  region?: string;
  latitude: string | number;
  longitude: string | number;
};

type EditPointValuesOut = z.infer<typeof editPointSchema>;

type EditPointDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  point: PointWithCoords | null;
  userId: string;
};

export function EditPointDialog({ open, onOpenChange, point, userId }: EditPointDialogProps) {
  const updatePoint = useUpdatePoint();

  const form = useForm<EditPointValuesIn, unknown, EditPointValuesOut>({
    resolver: zodResolver(editPointSchema) as Resolver<EditPointValuesIn, unknown, EditPointValuesOut>,
    defaultValues: {
      title: '',
      description: '',
      region: '',
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    if (point && open) {
      form.reset({
        title: point.title,
        description: point.description ?? '',
        region: point.region ?? '',
        latitude: point.lat,
        longitude: point.lng,
      });
    }
  }, [point, open, form]);

  async function onSubmit(values: EditPointValuesOut) {
    if (!point) return;

    try {
      await updatePoint.mutateAsync({
        id: point.id,
        userId,
        title: values.title.trim(),
        description: values.description?.trim() ? values.description.trim() : null,
        region: values.region?.trim() ? values.region.trim() : null,
        lat: values.latitude,
        lng: values.longitude,
      });
      toast.success('Point updated');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update point');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Edit point</DialogTitle>
          <DialogDescription>
            Update title, description, region, or coordinates. Map uses latitude first, then longitude
            (WGS84).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Mir Castle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short travel note..." className="min-h-[88px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <select {...field} className={cn(belarusRegionSelectClassName)}>
                      {BELARUS_REGION_OPTIONS.map((opt) => (
                        <option key={opt.value || 'none'} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter showCloseButton={false} className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePoint.isPending}>
                {updatePoint.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
