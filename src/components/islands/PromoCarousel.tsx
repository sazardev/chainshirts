import { useEffect, useState } from 'preact/hooks';
import { clientHref } from '../../lib/paths';

interface Slide {
  src: string;
  alt: string;
  href: string;
  eyebrow: string;
  title: string;
  text: string;
}

export default function PromoCarousel({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const current = slides[active] ?? slides[0];
  if (!current) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Current promotions"
      class="relative overflow-hidden rounded-xl border border-border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div class="relative h-56 sm:h-72 lg:h-80">
        <a
          key={current.src}
          href={clientHref(current.href)}
          aria-label={current.title}
          class="absolute inset-0 block"
        >
          <img src={current.src} alt={current.alt} class="h-full w-full object-cover" />
        </a>
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-r from-canvas/85 via-canvas/30 to-transparent"
          aria-hidden="true"
        />
        <div class="pointer-events-none absolute inset-y-0 left-0 flex max-w-lg flex-col justify-center p-6 sm:p-10">
          <p class="eyebrow">{current.eyebrow}</p>
          <h2 class="mt-2 text-2xl font-extrabold text-white sm:text-4xl">{current.title}</h2>
          <p class="mt-2 text-body-md text-white/80">{current.text}</p>
          <span class="mt-5 inline-flex w-fit min-h-11 items-center rounded-md bg-brand px-5 text-sm font-bold text-on-brand">
            Shop the offer →
          </span>
        </div>
      </div>
      <fieldset class="absolute bottom-4 right-4 flex items-center gap-2 border-0 p-0">
        <legend class="sr-only">Choose promotion</legend>
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show promotion ${index + 1}: ${slide.title}`}
            aria-current={index === active}
            onClick={() => setActive(index)}
            class="flex h-11 w-11 items-center justify-center rounded-full"
          >
            <span
              class={`block h-2.5 rounded-full transition-all duration-200 ${index === active ? 'w-7 bg-brand' : 'w-2.5 bg-white/60 group-hover:bg-white'}`}
            />
          </button>
        ))}
      </fieldset>
    </section>
  );
}
