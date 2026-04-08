/** Oblast-level regions for Belarus (travel app UI). */
export const BELARUS_REGION_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'Brest Region', label: 'Brest Region' },
  { value: 'Gomel Region', label: 'Gomel Region' },
  { value: 'Grodno Region', label: 'Grodno Region' },
  { value: 'Minsk Region', label: 'Minsk Region' },
  { value: 'Mogilev Region', label: 'Mogilev Region' },
  { value: 'Vitebsk Region', label: 'Vitebsk Region' },
  { value: 'Minsk City', label: 'Minsk City' },
] as const;

export const belarusRegionSelectClassName =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30';
