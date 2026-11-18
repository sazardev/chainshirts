import { useEffect, useRef, useState } from 'preact/hooks';

export default function IntroVideo() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      trigger.current?.focus();
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        title="Play the ChainShirts brand film"
        class="inline-flex min-h-12 items-center gap-3 rounded-md border border-white/40 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-sm transition-colors duration-quick hover:bg-white/20"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        Watch the film
      </button>

      {open && (
        <div
          class="fixed inset-0 z-60 flex items-center justify-center bg-canvas/90 p-4"
          role="presentation"
          data-modal=""
        >
          <div
            class="w-full max-w-4xl"
            role="dialog"
            aria-modal="true"
            aria-label="ChainShirts brand film"
          >
            <div class="mb-3 flex items-center justify-between">
              <p class="text-body-md font-semibold text-white">The ChainShirts film · 00:10</p>
              <button
                ref={closeButton}
                type="button"
                onClick={close}
                aria-label="Close video"
                class="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <video
              class="w-full rounded-lg border border-white/20 shadow-modal"
              controls
              autoplay
              playsinline
              poster="/video/poster.webp"
            >
              <track
                kind="captions"
                src="/video/captions.vtt"
                srclang="en"
                label="English"
                default
              />
              <source src="/video/intro.webm" type="video/webm" />
              <source src="/video/intro.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </>
  );
}
