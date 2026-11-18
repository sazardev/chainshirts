const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000_000],
  ['month', 2_592_000_000],
  ['week', 604_800_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

export function relativeTime(iso: string, now: number = Date.now()): string {
  const elapsed = Date.parse(iso) - now;
  const absolute = Math.abs(elapsed);
  for (const [unit, milliseconds] of UNITS) {
    if (absolute >= milliseconds) {
      return relativeFormatter.format(Math.round(elapsed / milliseconds), unit);
    }
  }
  return 'just now';
}

export function fullTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso));
}
