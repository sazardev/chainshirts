# SPEC.md: ChainShirts Anime Fashion Mock Store

## Summary

ChainShirts is a static, download-only anime fashion storefront themed around Chainsaw Man, selling clothing (t-shirts, hoodies, pants) and anime/manga merchandise (mice, keyboards, accessories). Every shopping process of a normal fashion store works end to end — browse, like, comment, buy, cart, user — but all data is locally stored and generated, and the result is a complete, fully functioning storefront experience.

This document is the **what and why**. `STACK.md` is the authority for **how it is built** (Astro 5 static site, TypeScript 7, one island framework, Tailwind 4, pnpm, Biome, Vitest/Playwright, Cloudflare). `DESIGN.md` is the authority for **how it looks and behaves** (Shopify Polaris tokens, components, motion, accessibility, content patterns). Where the three documents disagree, the resolution is recorded in [Decisions](#decisions).

## Problem

A portfolio needs a project that demonstrates end-to-end product work (UI, state, persistence, interactions), but a real storefront requires servers, payments and inventory nobody wants to commit to. Until now the only options were throwaway small demos that lack the full normal-store flow, so whoever inspects the portfolio cannot verify that the author can build a complete, reactive store experience.

## Goals

- One static download runs with no backend and no network dependency: open the built entry page and the whole store works offline.
- Every normal fashion-store process is reachable and completes: browse catalog, open a product, like, comment, add to cart, check out, view account and order history.
- The UI is reactive: every like, comment, cart and user change reflects immediately in all views that display it.
- At least the catalog categories named in the draft are populated with fake products: t-shirts, hoodies, pants, mice, keyboards.
- The site is visually Chainsaw Man themed throughout (branding, dark/neon graded stock photography, tone), expressed through Polaris design tokens rather than ad-hoc styles.
- The implementation follows `STACK.md` quality gates exactly, so the spec doubles as an audit checklist.

## Non-goals

- Real payments, real shipping, real inventory or any external service call.
- A server, database, API or SSR adapter: the site is a static Astro build.
- Real user accounts, authentication or multi-device sync.
- Content moderation, spam protection or comment security.
- Admin/back-office for managing products: the catalog is fixed, build-time fake data.
- Comment replies, notifications, a command palette, i18n of store content, or a mobile app.
- Copyrighted Chainsaw Man imagery: photography is licensed stock (Pexels), graded to a fictional neon theme, not copyrighted frames.

## Decisions

The 12 open questions of the draft are resolved here. Each answer cites the document that decided it.

| ID  | Question                   | Decision                                                                                                                                                                                                                                                                                                                                                                          | Authority                                                            |
| --- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Q1  | Admin view?                | **No.** Catalog is fixed, generated from local content collections + seeded fake data. No product CRUD UI.                                                                                                                                                                                                                                                                        | Draft non-goal; `STACK.md` content collections                       |
| Q2  | `file://` vs local server? | Downloadable artifact is the **pre-built `dist/`** with relative asset/URL paths — no build step for the reviewer. Static pages (home, catalog, product) render from `file://`. Full interactive flows run through `pnpm preview` (a local static server): browsers block ES modules on `file://`, so islands cannot hydrate there. No remote origin is contacted in either mode. | `STACK.md` Commands (`pnpm build`, `pnpm preview`); browser security |
| Q3  | Framework?                 | **Astro 5** static output, **TypeScript 7**, one island framework: **Preact**. Svelte is the documented alternative but is not used. No React, no second UI framework.                                                                                                                                                                                                            | `STACK.md` Stack and Dependencies                                    |
| Q4  | Length/field limits?       | Display name 1–40 chars; comment 1–500 chars (trimmed); checkout name 1–80, address 1–160, city 1–80, postal code 1–16, card 16 digits (format only). Inline errors with `aria-describedby` + `aria-invalid`.                                                                                                                                                                     | `DESIGN.md` Forms / Accessibility                                    |
| Q5  | Persistence scope?         | Per-user isolation for generated state (`user:<id>` namespaces); seeded catalog and seeded social data are global; active user id stored separately. `storage` events sync tabs.                                                                                                                                                                                                  | Draft FR-8; `STACK.md` Persistence                                   |
| Q6  | Checkout fields?           | Required: name, address, city, postal code. Card field is format-checked (16 digits, Luhn) only, **never stored**, never sent. No real payment validation.                                                                                                                                                                                                                        | Draft non-goal; `DESIGN.md` Security                                 |
| Q7  | Quantity 0?                | **Remove the item** and show an 8 s "Removed — Undo" toast (undo preferred over confirmation for reversible actions).                                                                                                                                                                                                                                                             | `DESIGN.md` Toast / undo                                             |
| Q8  | Schema migration?          | `schemaVersion: 2`. Additive, forward migrations; unknown or older incompatible schema → clear and reseed with a non-blocking Banner.                                                                                                                                                                                                                                             | `STACK.md` API backward compatibility, Error handling                |
| Q9  | Image source?              | **Real stock photography** from Pexels (free license): 112 product covers, 176 gallery photos, 11 category images, 6 promo banners, a lifestyle hero, an OG image and a 10-second brand film. Everything is colour-graded, WebP-compressed and processed by `astro:assets`; no runtime hotlinks. Sources in `CREDITS.md`.                                                         | User direction; `STACK.md` Images / Dependencies                     |
| Q10 | UI language?               | **English**, sentence case, verb-first buttons.                                                                                                                                                                                                                                                                                                                                   | `DESIGN.md` Content guidelines                                       |
| Q11 | Ratings?                   | **Included**: product rating + review count on cards, detail pages and structured data, plus shopper testimonials. Comment replies remain out of scope.                                                                                                                                                                                                                           | User direction (store realism)                                       |
| Q12 | Counts in account?         | Like and comment counts on cards and detail; account view aggregates the current user's likes, comments and orders.                                                                                                                                                                                                                                                               | Draft FR-4 / FR-8                                                    |

### Explicit deviations from the source documents

These conflicts are resolved deliberately; each must be re-checked if the source documents change.

1. **`DESIGN.md` says use `@shopify/polaris` components inside `AppProvider`; `STACK.md` forbids a second UI framework and mandates Preact/Svelte islands.** Resolution: adopt all Polaris **tokens, patterns and content rules**, and reimplement the needed components (Button, Card, TextField, Badge, Banner, Toast, EmptyState, Modal, table) as `.astro` components and Preact islands styled with Tailwind utilities from the mirrored tokens. Do not add React. Reason: one UI framework only, per `STACK.md`; breaking this would double runtime and violate the JS budget.
2. **Accessibility level:** `STACK.md` requires WCAG **2.2** AA, `DESIGN.md` says 2.1 AA. Resolution: **2.2 AA** (stricter wins).
3. **`<ClientRouter />` view transitions:** deferred. The downloadable build relies on plain static links so it works from `file://` and any subdirectory; SPA history routing would break there. Revisit only if the site is deployed exclusively to Cloudflare Pages.
4. **Sitemap / RSS / Pagefind:** `@astrojs/sitemap` is enabled and every page carries SEO meta, canonical and JSON-LD. RSS stays out of scope (no blog); catalog search and filters are local client-side data, so Pagefind is not used.
5. **Dark mode:** included. Both token sets exist, `prefers-color-scheme` is the default, and a manual Light/Dark/System switch is provided via the `ThemeToggle` island; the Chainsaw Man neon accents are defined against the near-black inverse surface.
6. **`DESIGN.md` admin-only patterns** (menu bar with shortcuts, notification bell, command palette, setup tours, IndexTable bulk actions): not applicable to a storefront and omitted. Cart and order history use responsive tables that become stacked cards below `md`.

## Users and scenarios

**Personas**

- **Portfolio reviewer**: downloads the built site, opens it offline via `pnpm preview`, and judges front-end and product skills.
- **Shopper (fake user)**: a local visitor who browses, reacts, comments and buys; all data is fictional and kept only in that browser.

**Scenarios**

1. Browse the catalog
   1. Shopper opens the built site and sees a Chainsaw Man themed home with featured products.
   2. Shopper filters/navigates to a category (t-shirts, hoodies, pants, mice, keyboards) via category links or filter chips; the active filter is visible in the URL.
   3. Shopper opens a product detail page generated from its content entry.
2. React and comment
   1. Shopper creates a local profile, then likes a product; the count updates immediately everywhere it is shown.
   2. Shopper writes a comment; it appears immediately with their name and a relative timestamp.
3. Buy
   1. Shopper adds a product (with size/quantity where applicable) to the cart; the header cart badge updates.
   2. Shopper opens the cart, changes quantity or removes an item, and sees the total update.
   3. Shopper completes the mock checkout and receives a fake order confirmation.
   4. Shopper sees the order in their local order history under Account.
4. Account
   1. Shopper creates or selects a local mock user profile.
   2. Likes, comments, cart and orders are associated with that local user and isolated from other profiles on the same browser.
5. Reviewer audit
   1. Reviewer extracts `dist/`, confirms the home/catalog/product pages render with zero remote requests, then runs `pnpm preview` offline and repeats scenarios 1–4 successfully with keyboard only and axe clean.

## Technical architecture

### Stack at a glance

| Layer           | Choice (from `STACK.md`)                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language        | TypeScript 7, `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`; `tsc --noEmit` checks only                                                                                                 |
| Framework       | Astro 5, `output: 'static'`, no SSR adapter                                                                                                                                                                    |
| Content         | `src/content.config.ts` with Zod schemas; products and categories as Markdown/MDX entries                                                                                                                      |
| Islands         | Preact, hydrated with the laziest directive that works (`client:visible` > `client:idle` > `client:load`); `client:only="preact"` only for state-dependent controls whose server HTML would otherwise be stale |
| Styling         | Tailwind CSS 4 via `@tailwindcss/vite`; tokens in `@theme` in `src/styles/app.css`, source of truth in `tokens.css`                                                                                            |
| Images          | `astro:assets` with width, height, `alt`, lazy loading                                                                                                                                                         |
| Tests           | Vitest (`lib/`), Playwright (built site, flows, links, axe, offline), Lighthouse CI                                                                                                                            |
| Quality         | Biome 2, Lefthook, Renovate, GitHub Actions CI, Cloudflare Pages deploy                                                                                                                                        |
| Package manager | pnpm                                                                                                                                                                                                           |

### Routes and data ownership

All routes are static and use `getStaticPaths` where parameterized. Pages contain no data logic: queries live in `src/lib/`.

| Route                 | File                                 | Data                            | Islands                                          |
| --------------------- | ------------------------------------ | ------------------------------- | ------------------------------------------------ |
| `/`                   | `src/pages/index.astro`              | `lib/catalog.ts` featured query | `LikeButton`, `AddToCartButton`, `ThemeToggle`   |
| `/catalog`            | `src/pages/catalog/index.astro`      | all products                    | `CatalogSearch`, `LikeButton`, `AddToCartButton` |
| `/categories/[slug]`  | `src/pages/categories/[slug].astro`  | products filtered by category   | same as catalog                                  |
| `/products/[slug]`    | `src/pages/products/[slug].astro`    | one product + seeded comments   | `ProductPurchasePanel`, `Comments`, `LikeButton` |
| `/cart`               | `src/pages/cart.astro`               | shell only                      | `CartPage`                                       |
| `/checkout`           | `src/pages/checkout.astro`           | shell only                      | `CheckoutForm`                                   |
| `/order-confirmation` | `src/pages/order-confirmation.astro` | order id from session state     | `OrderConfirmation`                              |
| `/account`            | `src/pages/account.astro`            | shell only                      | `Account`                                        |
| `/profile`            | `src/pages/profile.astro`            | shell only                      | `ProfileForm`                                    |
| `/404`                | `src/pages/404.astro`                | static                          | none                                             |

Dependency direction: `pages → layouts → components → lib`; `lib` is plain TypeScript with no `.astro` imports; islands never import `.astro` files.

### Project layout

```
src/
  content.config.ts                 collections + Zod schemas (products, categories)
  content/
    categories/*.md                 t-shirts, hoodies, pants, mice, keyboards, accessories
    products/*.md                   seeded fake products (priceMinor, currency, sizes, images, seed likes)
  pages/                            routes only (see table)
  layouts/BaseLayout.astro          <html>, head, Seo, Header, Footer
  components/
    Seo.astro                       title, description, canonical, Open Graph
    Header.astro                    nav, cart-count badge, account link
    Footer.astro
    ProductCard.astro
    CategoryTile.astro
    FilterChips.astro
    EmptyState.astro
    Banner.astro
    islands/
      ThemeToggle.tsx  LikeButton.tsx  AddToCartButton.tsx
      CatalogSearch.tsx  ProductPurchasePanel.tsx  Comments.tsx
      CartPage.tsx  CheckoutForm.tsx  OrderConfirmation.tsx
      Account.tsx  ProfileForm.tsx  ToastHost.tsx
  lib/
    catalog.ts                      queries over content collections (sort, filter, drafts)
    format-money.ts                 minor units -> display string
    format-date.ts                  ISO 8601 -> relative time (full timestamp in title)
    domain/                         product.ts, cart.ts, order.ts, money.ts (entities + rules)
    store/
      ports.ts                      StorePort, Clock, IdGenerator (core-owned interfaces)
      schema.ts                     versioned localStorage shape + Zod validators
      migrate.ts                    v1 -> v2, reset fallback
      local-storage-adapter.ts      implements StorePort; graceful degradation
      fake-data.ts                  deterministic seeded users, comments, likes
      use-cases/                    toggle-like.ts, add-comment.ts, add-to-cart.ts,
                                    update-cart-quantity.ts, remove-from-cart.ts,
                                    place-order.ts, manage-profile.ts
      index.ts                      small public facade (composition root)
    reactive/actions.ts              UI actions that call use cases and dispatch toasts
    reactive/toasts.ts               toast events and durations
  components/islands/ui/use-store.ts hook that reads storage on render + listens for changes
  styles/tokens.css                 every custom property (Polaris + Chainsaw Man accents)
  styles/app.css                    @import "tailwindcss"; @theme mirrors tokens; @layer order
  assets/products/                  112 graded Pexels covers + gallery/ (176 alternates), WebP
  assets/categories/                6 graded Pexels category photos (WebP)
  assets/banners/                   3 graded promo banners (WebP)
  assets/hero.webp, og-image        lifestyle hero and social preview
  public/video/                     brand film (mp4/webm), poster and captions
public/                              favicon.svg, fonts/Inter-*.woff2, robots.txt
scripts/fetch-*.py, generate-video.py  download, grade and compress photos; build the brand film
tests/unit/                          Vitest specs for lib/
tests/e2e/                           Playwright specs for the built site
```

### Content and storage model

Build-time content collections (type-checked, Zod-validated):

| Collection   | Key fields                                                                                                                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `categories` | `id`, `name`, `slug`, `description`, `image`                                                                                                                                                                                 |
| `products`   | `id`, `slug`, `name`, `description`, `priceMinor` (integer), `currency` (`'USD'`), `category` (reference), `images[]` (local assets with `alt`), `sizes[]` (`[]` for non-clothing), `seedLikeCount`, `createdAt`, `featured` |

Runtime localStorage state (versioned, per-user where marked):

| Entity      | Fields                                                                                                                                   | Scope                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `Profile`   | `id`, `displayName`, `avatar`, `createdAt`                                                                                               | active id global; profiles by id |
| `Like`      | `userId`, `productId`, `createdAt`                                                                                                       | per user                         |
| `Comment`   | `id`, `productId`, `userId`, `text`, `createdAt`, `editedAt?`                                                                            | per user (seed comments global)  |
| `Cart`      | `userId`, `items[]`, `updatedAt`                                                                                                         | per user                         |
| `CartItem`  | `productId`, `name`, `size`, `quantity`, `unitPriceMinor`                                                                                | inside Cart                      |
| `Order`     | `id`, `userId`, `lines[]`, `subtotalMinor`, `discountMinor`, `promoCode`, `totalMinor`, `currency`, `status`, `placedAt`, `shippingInfo` | per user                         |
| `OrderLine` | `productId`, `name`, `size`, `quantity`, `unitPriceMinor`                                                                                | snapshot inside Order            |
| `Meta`      | `schemaVersion`, `activeUserId`                                                                                                          | global                           |

Derived values: `cart total = Σ(quantity × unitPriceMinor)`; `order total` is snapshotted at checkout. Money is always integer minor units plus currency (`STACK.md` API design). Products carry a stable `id` independent of `slug` so slug changes do not orphan stored likes/cart lines; changing a URL still requires a redirect entry in `astro.config.mjs`.

Seed data (`lib/store/fake-data.ts`) generates fictional users, comments and likes from a fixed seed and injectable `Clock`/`IdGenerator`, so unit tests are deterministic. Product, category and hero images are licensed Pexels photos downloaded by `scripts/fetch-stock.py`, colour-graded to the pulp/chain/neon palette and stored locally as compressed WebP — not copyrighted frames. `CREDITS.md` records every source URL.

### Modules and dependency rule

Business logic follows the Clean/Hexagonal patterns in `STACK.md`:

- **Domain** (`lib/domain/`) holds entities and rules only (`cart total`, quantity clamp to `[1,99]`, duplicate `productId + size` increments quantity, order snapshot). It imports nothing from Astro, Preact or localStorage.
- **Application** (`lib/store/use-cases/`) has one action per file with its own input/output types and a `StorePort` interface declared in `ports.ts`. Expected failures are values, not exceptions: `ErrNoProfile`, `ErrEmptyCart`, `ErrInvalidField`, `ErrStorageUnavailable`, `ErrNotFound`.
- **Adapters** (`local-storage-adapter.ts`, `fake-data.ts`) implement the ports at the edge; a storage failure surfaces a non-blocking Banner and never crashes rendering.
- **Composition root** (`lib/store/index.ts`) wires the adapter into use cases; no other module instantiates storage. Islands and pages import only this facade.
- Every use case has a Vitest unit test with an in-memory fake port.

Storage facade (rewritten from the draft, typed and result-returning):

```
getProducts(): Product[]                         // build-time catalog facade
getCart(userId): Result<Cart, StoreError>
addToCart(userId, productId, size, qty): Result<Cart, StoreError>
setCartQuantity(userId, productId, size, qty): Result<Cart, StoreError>
removeFromCart(userId, productId, size): Result<Cart, StoreError>
toggleLike(userId, productId): Result<LikeState, StoreError>
addComment(userId, productId, text): Result<Comment, StoreError>
getProfile(): Profile | null
createProfile(displayName): Result<Profile, StoreError>
placeOrder(userId, checkoutData): Result<Order, StoreError>
getOrders(userId): Order[]
```

### Reactivity and accessibility plumbing

Astro bundles every island as its own Vite entry, so module-level state is not reliably shared between islands. Instead, `components/islands/ui/use-store.ts` reads localStorage on each render and listens for a custom `STATE_EVENT` (dispatched by the storage adapter on every write) plus the native `storage` event for cross-tab sync. Controls whose server HTML would be stale (like buttons) use `client:only="preact"`. Target: reflected in all views within 100 ms. Toasts are dispatched as DOM events so every island bundle sees them, and render in a dedicated `role="status"` region (errors `role="alert"`) without stealing focus. New comments are announced politely via `aria-live="polite"`.

### Styling and design tokens

`src/styles/tokens.css` is the single place any raw color, size or duration is declared; `src/styles/app.css` mirrors it into Tailwind 4 `@theme` and defines `@layer reset, tokens, base, components, utilities`. Components use generated utilities only (`bg-surface`, `text-muted`, `text-critical`, `space-*`, `radius-*`) — no hardcoded hex, font size, radius or arbitrary value without a token/comment.

| DESIGN token                                                                           | CSS / Tailwind token                                                                              | Use                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `--p-color-bg` / `bg-surface` / `bg-surface-secondary`                                 | `--color-bg` / `--color-surface` / `--color-surface-secondary`                                    | page, cards, nested areas              |
| `--p-color-text` / `text-secondary` / `text-disabled`                                  | `--color-text` / `--color-muted` / `--color-disabled`                                             | body, help text, disabled              |
| `--p-color-text-link` / `border-focus`                                                 | `--color-link` / `--color-focus`                                                                  | links, 2px focus ring                  |
| `--p-color-text-critical` / `bg-fill-critical` / `bg-fill-success` / `bg-fill-warning` | `--color-critical` / `--color-danger` / `--color-success` / `--color-warning`                     | errors, destructive, badges            |
| `--p-color-bg-fill-brand`                                                              | `--color-brand` (Chainsaw Man brand hex replaces the `TODO`)                                      | primary buttons                        |
| neon magenta/cyan/violet on `#0B0612`                                                  | `--color-accent-magenta` / `--color-accent-cyan` / `--color-accent-violet` / `--color-bg-inverse` | dark theme and themed accents          |
| `--p-space-*`                                                                          | `--space-*` (4 px base)                                                                           | all layout gaps and padding            |
| `--p-border-radius-*`                                                                  | `--radius-*`                                                                                      | small controls, buttons, cards, modals |
| `--p-shadow-*`                                                                         | `--shadow-*`                                                                                      | cards, popovers, button bevel          |
| `--p-motion-duration-*` / `--p-motion-ease`                                            | `--duration-*` / `--ease-*`                                                                       | all transitions                        |
| Inter / mono                                                                           | `--font-sans` (self-hosted woff2) / `--font-mono`                                                 | all text                               |

Type scale variants (`headingXl`, `headingMd`, `bodyMd`, `bodySm`, …) become `@theme` text utilities; font sizes use `rem`/`clamp`, borders only use `px`. Focus rings are 2px `--color-focus`; touch targets ≥ 44×44 px. All motion is behind `@media (prefers-reduced-motion: no-preference)`; reduced motion permits only ≤150 ms opacity fades. Glass/glow effects follow `DESIGN.md` guards (`@supports`, high contrast, reduced transparency) and never carry meaning alone.

### Component mapping

| Polaris pattern                                                | Implementation                                                                                                                                                                                                                           |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Page`, `Layout`, `Card`, `BlockStack`, `InlineStack`, `Box`   | `BaseLayout`, `ProductCard.astro`, space-token flex/grid; full-width catalog container up to 1440 px                                                                                                                                     |
| `Button` (primary/secondary/tertiary/plain, `tone="critical"`) | shared button variant helper used by `.astro` and islands; one primary action per page                                                                                                                                                   |
| `TextField`, `FormLayout`                                      | `Field` island with visible label, help text, inline error, `aria-describedby`, `aria-invalid`                                                                                                                                           |
| `Badge`, `Banner`, `Toast`, `EmptyState`                       | `Badge` island; `Banner.astro`; `ToastHost.tsx`; `EmptyState.astro` (title, one sentence, one action)                                                                                                                                    |
| `Modal`                                                        | confirmation for the Account "Reset local data" danger-zone action only                                                                                                                                                                  |
| `IndexTable` / `DataTable`                                     | responsive `<table>` for cart/order history, stacked cards below `md`, keyboard reachable                                                                                                                                                |
| Comment item / composer                                        | `Comments.tsx`: 32 px avatar, author, relative time with full timestamp on `title`, 14–15 px body, composer grows to 8 lines, `Cmd/Ctrl+Enter` sends, optimistic "Sending…" state, empty state, length limit. No replies/edit by others. |

Content rules: sentence case, verbs on buttons, no "Oops"/jokes, result-then-next-step messages ("Added to cart — View cart"), errors that say how to fix the problem, and never clearing input after a failed submit.

## Requirements

Acceptance criteria are Given/When/Then and are wired to concrete tests.

**FR-1 — Static offline storefront**
The system must run entirely from static files with no network calls.

- Given a built `dist/` extracted on an offline machine, when `index.html` is opened, then home, catalog and product pages render without error.
- Given any page load, when the browser network log is inspected, then no request targets a non-local origin (Playwright aborts and asserts zero external requests).
- Given full interaction is required, when the reviewer runs `pnpm preview`, then all flows work with no remote calls.

**FR-2 — Chainsaw Man themed catalog**

- Given the home page, when it loads, then branding, graded stock photography and the token palette reflect the Chainsaw Man theme in light and dark modes.
- Given the catalog, when it is populated, then it contains at least t-shirts, hoodies, pants, mice and keyboards, plus accessories, all from Zod-validated content entries.
- Given any product, when displayed, then it has name, local image with `alt`, price in minor units + currency, category and description.

**FR-3 — Product detail**

- Given a product card, when opened, then its static route (`/products/[slug]`) shows name, images, price, description, like state/count and seeded + local comments.
- Given a clothing product, when displayed, then available sizes are offered via `ProductPurchasePanel`; non-clothing items have no size selector.

**FR-4 — Likes**

- Given an unliked product and an active profile, when liked, then the count increments and state persists locally, reflected on card, detail and Account within 100 ms.
- Given a liked product, when unliked, then the count decrements and persists.
- Given no active profile, when the shopper likes, then a prompt to create/select a profile appears (Banner or toast with action).
- Given a like on detail, when returning to catalog, then like state is consistent.

**FR-5 — Comments**

- Given non-empty text (1–500 trimmed chars) and an active profile, when submitted, then it appears immediately with name, relative timestamp and optimistic "Sending…" state, then persists.
- Given empty/whitespace-only text, when submitted, then submission is blocked with an inline error linked by `aria-describedby`.
- Given the site is reopened, when the product page loads, then seeded and previously stored comments are listed.
- Given the current user's own comment, when edited or deleted, then "(edited)" is shown or the removal is announced politely; drafts are never lost on failure.

**FR-6 — Cart**

- Given a product, when added with quantity/size, then it appears in the cart, duplicate `productId + size` increments quantity, and the header badge updates.
- Given cart lines, when quantity changes, then line totals and cart total update immediately; quantity 0 removes the line with an 8 s Undo toast.
- Given a clothing product, when added, then the selected size is stored with the line.
- Given the site is reopened, when the cart opens, then its contents are still present.

**FR-7 — Checkout**

- Given a non-empty cart, when the shopper confirms, then an order with snapshotted lines, subtotal, promo discount and total is created and `/order-confirmation` shows the id, lines and total.
- Given the order was created, when checkout finishes, then the cart is emptied.
- Given invalid/missing required fields or an empty cart, when confirmed, then the order is blocked, the first invalid field is focused, and inline errors are shown; card data is never stored.

**FR-8 — Local user profile**

- Given no profile, when created (1–40 chars), then it is stored, shown in the header, and selectable on `/profile`.
- Given a stored profile, when likes/comments/cart/orders are made, then they are associated with it and isolated from other profiles on the browser.
- Given `/account`, when opened, then the shopper sees their profile, likes, comments and order history, each with accessible empty states.

**FR-9 — Fake data set**

- Given a fresh install, when the site loads, then products, prices, images, like counts and seeded comments are already populated from local fake data.
- Given the data set, when inspected, then no entry originates from a real catalog or external API, and generation is deterministic with fixed seed/injected clock.

## Non-functional requirements

- **NFR-1 — Offline/static delivery**: pre-built `dist/`, relative URLs, zero runtime network requests, no reviewer build step. Static browsing on `file://`; full interactivity via local static server.
- **NFR-2 — Persistence**: all generated state survives reload via versioned localStorage with per-user isolation, additive migrations and clear-and-reseed fallback.
- **NFR-3 — Responsiveness**: catalog, product, cart and checkout usable 360–1440 px; content reflows at 320 px and 200% zoom; bottom-half primary actions on touch.
- **NFR-4 — Performance**: first meaningful catalog render < 2 s from local files; Lighthouse performance ≥ 95 on home and catalog.
- **NFR-5 — Reactivity**: like/comment/cart/checkout changes reflected in every view within 100 ms without reload.
- **NFR-6 — Accessibility**: WCAG 2.2 AA; keyboard-only flows; visible 2px focus; alt text; labels on all fields; live regions; reduced motion; axe reports zero violations; Lighthouse accessibility 100.
- **NFR-7 — Privacy**: no analytics, telemetry or external fonts; no data leaves the machine; generated users are fictional; card number never persisted.
- **NFR-8 — JS budget**: pages without islands ship 0 KB JS; island JS per page < 50 KB gzipped; Lighthouse SEO 100 on key pages.
- **NFR-9 — Quality gates**: `astro check`, `tsc --noEmit`, `biome ci .`, `pnpm vitest run`, `pnpm playwright test` and Lighthouse CI all pass in `.github/workflows/ci.yml` exactly as listed in `STACK.md`.

## Interfaces

**Screens**: Home, Catalog, Category, Product detail, Cart, Checkout, Order confirmation, Account, Profile, 404 — as routed in the table above.

**Local interfaces**: the typed storage facade and deterministic `fake-data` module described above, plus the reactive store facade. All are synchronous or promise-based and network-free.

**Commands** (from `STACK.md`):

| Task                   | Command                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| Install                | `pnpm install && pnpm astro sync && lefthook install`                         |
| Build                  | `pnpm build`                                                                  |
| Reviewer run (offline) | `pnpm preview` (or any static server over `dist/`)                            |
| Dev                    | `wrangler dev` (only if server routes are added; not needed for static build) |
| Type/content check     | `pnpm astro check`                                                            |
| Typecheck              | `tsc --noEmit` (`--watch` locally)                                            |
| Lint / format          | `biome check .` / `biome check --write .`                                     |
| Tests                  | `pnpm vitest run && pnpm playwright test`                                     |
| Deploy                 | `wrangler deploy`                                                             |

## Edge cases

- Like/comment with no profile → prompt to create/select one first (no data written).
- Empty/whitespace comment or over-limit name/comment → rejected inline; text preserved.
- Cart quantity 0 → remove with Undo toast; quantity > 99 clamped; duplicate add increments existing line.
- Checkout with empty cart or invalid fields → blocked, first invalid field focused; card data not stored.
- Product missing from a newer catalog but referenced by a stored order → order renders its snapshotted line.
- localStorage unavailable/full → site still renders; non-blocking Banner, no crash.
- Older/unknown schema → additive migration or clear-and-reseed with Banner notice.
- Offline first open → all features work from bundled assets; no hotlinked images.
- Cross-tab edits → `storage` events re-render each island without duplicate submissions.

## Testing strategy

- **Vitest**: money/cart/order rules, Zod schema validation, migration (v1→v2, reset), seeded data determinism, every use case with in-memory fake ports.
- **Playwright on the built site**: all five scenarios end to end; link integrity; keyboard-only run; axe scan of every screen; external-request assertion; responsive snapshots at 360/768/1280/1440 and 200% zoom; reduced-motion run.
- **Lighthouse CI**: budgets from NFR-4/NFR-6/NFR-8 enforced on home and catalog.
- Regression rule: every fixed bug gets a failing-first test in the same change (`STACK.md` Testing).

## Milestones

1. **Foundation + theme**: Astro scaffold, content config, `@theme`/`tokens.css`, `BaseLayout`/`Seo`/`Header`/`ThemeToggle`, static home, offline check, CI skeleton. Ships a browsable shell.
2. **Fake catalog**: seeded product/category collections, compressed graded stock photos, catalog/category/product pages, cards, sizes, `astro:assets`. Ships full browsing.
3. **Store core + social**: domain/ports/adapters/use-cases, localStorage migration, profile, `LikeButton`, `Comments`, `ToastHost`. Ships social interactions.
4. **Cart**: add/update/remove, totals, persistence, Undo toast, header badge. Ships a working cart.
5. **Checkout + account**: validated checkout, order placement, confirmation, per-user order history. Ships the complete store flow.
6. **Polish + audit**: a11y (axe, keyboard), 320–1440 px, Lighthouse, offline Playwright, reviewer audit, README documenting run modes and the deviations above.
