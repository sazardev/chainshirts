# ChainShirts

A complete, downloadable anime streetwear storefront. Browse a 112-product catalog across six categories, open detailed product pages with size and colour variants, save favourites, write reviews, build a bag, apply a promo code and check out — with a landing page, brand film, promotions, collections and a responsive, accessible interface.

Built with the stack in `STACK.md` (Astro 5, TypeScript, Tailwind 4, Preact islands, Biome, Vitest, Playwright) and the design language in `DESIGN.md` (Shopify Polaris tokens with a Chainsaw Man neon layer). The full product contract is in `SPEC.md`.

## Run it

```bash
pnpm install
pnpm build          # writes dist/ (and rewrites paths for file:// compatibility)
pnpm preview        # http://localhost:4321
```

`dist/` is the downloadable artifact: static pages render directly from `file://` and make zero remote requests. Because browsers block ES modules on `file://`, interactive features need a local static server (`pnpm preview`); that still requires no internet.

## What is inside

- **112 products**, each with two graded stock photos, brand, rating, review count, original/reduced price, sizes, colours and badges.
- **Landing page** with an autoplaying brand film, promo carousel, countdown to the next drop, deals, tabbed best sellers / new arrivals / top rated, collections, reviews and a newsletter form.
- **Promotions:** `CHAOS15`, `NEON10` and `FAN20` are applied at checkout and reflected in the order summary and confirmation.
- **Collections:** six curated routes — Public Safety, Desk Dominion, Neon Nights, Night Runners, Shelf Legends and Sound System.
- **Journal:** six long-form articles with dedicated routes and structured data.
- **Catalog:** category chips, live search, price slider, sorting and an on-sale filter.
- **Account:** favourites, reviews, order history and profile switching.
- **SEO:** canonical URLs, Open Graph/Twitter meta, JSON-LD structured data, sitemap and `robots.txt`.
- **Brand film:** a 10-second silent MP4/WebM with captions, self-hosted in `public/video/`.

## Commands

| Task                      | Command                                         |
| ------------------------- | ----------------------------------------------- |
| Dev                       | `pnpm dev`                                      |
| Build                     | `pnpm build`                                    |
| Preview                   | `pnpm preview`                                  |
| Content + component check | `pnpm check`                                    |
| Typecheck                 | `pnpm typecheck`                                |
| Lint / format             | `pnpm lint` / `pnpm format`                     |
| Tests                     | `pnpm test`                                     |
| Refresh photos            | `pnpm art` (needs network; writes `CREDITS.md`) |
| Deploy                    | `pnpm deploy`                                   |

## Architecture notes

- Products and categories are Markdown/MDX entries validated by Zod in `src/content.config.ts`; `src/lib/catalog.ts` owns all queries.
- Domain rules and use cases live in `src/lib/domain/` and `src/lib/store/use-cases/`. A `StorePort` is implemented by a `localStorage` adapter; `src/lib/store/index.ts` is the composition root. Data is versioned and per-profile.
- Astro bundles each island as its own entry, so islands read state from storage on render and re-render on `STATE_EVENT` / native `storage` events. Controls with state-dependent server HTML use `client:only="preact"`.
- Every raw design value lives in `src/styles/tokens.css`, mirrored into Tailwind's `@theme` in `src/styles/app.css`.
- Photography is sourced from Pexels under the Pexels License, graded and re-encoded as WebP by the scripts in `scripts/`; every source URL is in `CREDITS.md`. ChainShirts is a fictional portfolio project and is not affiliated with Chainsaw Man or its rights holders.

## Quality gates

`pnpm lint`, `pnpm typecheck`, `pnpm check`, `pnpm test` and `pnpm build` pass locally and run in `.github/workflows/ci.yml`. Lighthouse budgets (performance ≥ 95, accessibility 100, SEO 100) are in `lighthouserc.json`.

`astro check` needs TypeScript 6's programmatic API while `tsc --noEmit` uses TypeScript 7, so the root `typescript` is pinned to 6 and TS 7 is installed as the `typescript7` alias. On machines with a system libvips, install with `SHARP_IGNORE_GLOBAL_LIBVIPS=1 pnpm install`.
