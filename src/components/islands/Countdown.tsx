import { useEffect, useState } from 'preact/hooks';

function nextDrop(): number {
  const now = new Date();
  const target = new Date(now);
  const daysUntilFriday = (5 - now.getUTCDay() + 7) % 7;
  target.setUTCDate(now.getUTCDate() + daysUntilFriday);
  target.setUTCHours(20, 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setUTCDate(target.getUTCDate() + 7);
  return target.getTime();
}

export default function Countdown({ label = 'Next drop in' }: { label?: string }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const target = nextDrop();
    const update = () => setRemaining(Math.max(0, target - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');

  return (
    <p class="flex items-center gap-2 text-body-sm font-semibold text-text" aria-live="off">
      <span class="text-muted">{label}</span>
      <span class="inline-flex items-center gap-1 font-mono tabular-nums text-text">
        <span class="rounded bg-brand px-1.5 py-0.5 text-on-brand">{pad(days)}d</span>
        <span class="rounded bg-brand px-1.5 py-0.5 text-on-brand">{pad(hours)}h</span>
        <span class="rounded bg-brand px-1.5 py-0.5 text-on-brand">{pad(minutes)}m</span>
        <span class="rounded bg-brand px-1.5 py-0.5 text-on-brand">{pad(seconds)}s</span>
      </span>
    </p>
  );
}
