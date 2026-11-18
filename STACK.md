# STACK.md: Astro content site

## Summary

A content-first website (docs, blog, marketing, portfolio) on Astro. Pages are rendered to static HTML at build time and
ship zero JavaScript by default; interactivity is added as isolated islands that hydrate only when needed. Content is
Markdown/MDX in type-checked content collections, so a typo in front matter fails the build instead of the page.

## Stack

| Layer           | Choice                                                                                                     | Why                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Language        | TypeScript 7 (native compiler, `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`)       | Same language, type checking about 10x faster: checks stay cheap enough to run on every save and in CI |
| Framework       | Astro 5                                                                                                    | Static by default, islands, content layer                                                              |
| Content         | Content collections (`src/content.config.ts`) with Zod schemas + MDX (`@astrojs/mdx`)                      | Validated front matter                                                                                 |
| Islands         | Preact or Svelte (one framework only)                                                                      | Small runtime for the few interactive parts                                                            |
| Styling         | Tailwind CSS 4 (`@tailwindcss/vite`), tokens in `@theme` in the main CSS file                              | Utilities generated from your tokens; no config file, fast builds                                      |
| Images          | `astro:assets` (`<Image />`, `<Picture />`)                                                                | Sizes, formats and lazy loading at build                                                               |
| SEO             | `@astrojs/sitemap`, RSS (`@astrojs/rss`), per-page meta component                                          |                                                                                                        |
| Search          | Pagefind (static index)                                                                                    | No server needed                                                                                       |
| Tests           | Vitest (utilities) + Playwright (pages, links, a11y with `@axe-core/playwright`)                           |                                                                                                        |
| Lint            | Biome 2 (`@biomejs/biome`): linter and formatter in one, `biome.json`                                      | One fast tool, one config, no plugin version drift                                                     |
| Deploy          | Cloudflare (Pages for static output, Workers for server routes), configured in `wrangler.toml`             | Global edge, free tier, KV/D1/R2 when data is needed                                                   |
| Package manager | pnpm                                                                                                       |                                                                                                        |
| Typecheck       | `tsc --noEmit` from the `typescript` 7 package (the bundler strips types, tsc only checks)                 | One source of truth for types, independent of the build                                                |
| CI              | GitHub Actions (`.github/workflows/ci.yml`) on every pull request and push to `main`                       | Runs the same quality gates as local, next to the code review                                          |
| Hooks           | Lefthook (`lefthook.yml`): pre-commit format + lint on staged files, commit-msg Conventional Commits check | Problems caught before they reach CI, in parallel and in milliseconds                                  |
| Updates         | Renovate (`renovate.json`): grouped weekly updates, automerge for patch and lockfile maintenance           | Dependencies stay current in small, reviewable steps                                                   |

## Project layout

```
src/
  content.config.ts                collections and their Zod schemas
  content/
    blog/2025-01-10-hello.mdx
    docs/getting-started.md
  pages/                           routes only
    index.astro
    blog/index.astro
    blog/[...slug].astro           getStaticPaths from the collection
    rss.xml.ts
  layouts/
    BaseLayout.astro               <html>, head, Seo, header, footer
    PostLayout.astro
  components/
    Seo.astro                      title, description, canonical, Open Graph
    Header.astro
    PostCard.astro
    islands/ThemeToggle.tsx        the only hydrated components live here
  lib/
    posts.ts                       queries over collections (sorting, drafts, tags)
    format-date.ts
  styles/global.css
public/                            files served as is (favicon, robots.txt)
tests/e2e/
```

Dependency direction: `pages → layouts → components → lib`; `lib` is plain TypeScript with no Astro components;
`components/islands` never import `.astro` files.

```
src/styles/app.css             @import "tailwindcss"; @theme { --color-*, --font-*, --spacing … } (the design tokens)
```

```
.github/workflows/ci.yml       jobs: lint (format + lint + typecheck), test, build; dependency cache; concurrency per branch
```

```
lefthook.yml                   pre-commit: format + lint ({staged_files}); commit-msg: conventional commit check
```

```
renovate.json                  extends config:recommended; schedule; packageRules: groups, automerge patch
```

## Conventions

- One file = one responsibility: one component, one layout, one query helper.
- `.astro` components by default; an island only when the user interacts with it, with the laziest directive that works (`client:visible` > `client:idle` > `client:load`).
- Every collection entry is validated by its schema; drafts are filtered in `lib/posts.ts`, never in pages.
- Every page sets title, description and canonical URL through `Seo.astro`.
- Images go through `astro:assets` with width, height and `alt`; decorative images use `alt=""`.
- URLs are stable: renaming a slug requires a redirect in `astro.config.mjs`.
- New section = a collection + schema → query helper in `lib/` → page with `getStaticPaths` → layout/components.
- `tsconfig.json` keeps `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax` and `isolatedModules` on; a file never lowers them locally.
- Types are checked by `tsc`, code is emitted by the bundler (Vite, the framework, Bun): never rely on `tsc` output files.
- Before upgrading, check that every tool that loads the compiler API (typescript-eslint, framework plugins, editor extensions) states TypeScript 7 support; if one lags, keep that tool on its supported version and say so in a comment next to the dependency.
- `biome.json` is the only lint/format config: no `.eslintrc*`, no `.prettierrc*` in the repository.
- Recommended rules on, plus `noExplicitAny`, `noUnusedVariables` and `useImportType` as errors.
- Imports are sorted by Biome (organize imports); never sort them by hand.
- Design tokens live in `@theme` (colors, fonts, radius, spacing) and mirror DESIGN.md; components use the generated utilities (`bg-primary`, `text-muted`).
- Long class lists are composed in one place (a variant helper such as `cva` or a component), not repeated across files.
- Arbitrary values (`w-[317px]`) only with a comment; a repeated one becomes a token.
- Bindings (KV, D1, R2, secrets) are declared in `wrangler.toml` and typed (`wrangler types`); code never reads `process.env` directly.
- Server code uses Web-standard APIs (`fetch`, `Request`, `Response`); Node-only modules are avoided or enabled with `nodejs_compat` explicitly.
- Secrets with `wrangler secret put`, never in `wrangler.toml`.
- CI runs exactly the commands in the Commands table; no CI-only scripts.
- Third-party actions are pinned to a full commit SHA; `permissions:` default to `contents: read`.
- `concurrency` cancels superseded runs on the same branch; `main` is protected and requires a green CI.
- Hooks run only the fast checks on staged files; tests stay in CI.
- Hooks run the same commands as the Commands table.
- Related packages update together (framework + its plugins, test tooling, linters).
- Patch updates and lockfile maintenance automerge only when CI is green; minor/major are reviewed.
- A major update gets its own pull request with the migration notes linked.

## Commands

| Task               | Command                                   |
| ------------------ | ----------------------------------------- |
| Install hooks      | `lefthook install`                        |
| Dev (edge runtime) | `wrangler dev`                            |
| Build              | `pnpm build`                              |
| Preview            | `pnpm preview`                            |
| Type/content check | `pnpm astro check`                        |
| Sync content types | `pnpm astro sync`                         |
| Lint               | `biome check .`                           |
| Format             | `biome check --write .`                   |
| Tests              | `pnpm vitest run && pnpm playwright test` |
| Typecheck (watch)  | `tsc --noEmit --watch`                    |
| Deploy             | `wrangler deploy`                         |

## Testing

- `astro check` is the first test: content schemas and component props.
- Vitest for `lib/` helpers (sorting, filtering, formatting).
- Playwright on the built site: key pages render, no broken internal links, no axe violations, RSS and sitemap valid.
- Lighthouse CI budget on the home page and a content page.

## Quality gates

- `astro check` with zero errors, ESLint `--max-warnings 0`, Prettier clean.
- Lighthouse: performance ≥ 95, accessibility 100, SEO 100 on key pages.
- JavaScript budget: pages without islands ship 0 KB of JS; total island JS per page under 50 KB gzipped.
- `tsc --noEmit` exits 0 in CI; no `@ts-ignore` (use `@ts-expect-error` with a reason).
- `biome ci .` passes in CI (lint and format, no writes).

## Dependencies

- Astro built-ins first (`astro:assets`, content collections, `<ClientRouter />` view transitions).
- Allowed: the table above; anything else needs a reason in the PR.
- Do NOT use: a second UI framework for islands, client-side routing libraries, jQuery, analytics scripts that block rendering, external image CDNs when `astro:assets` is enough, Google Fonts links (self-host fonts).

## Rules for agents

- Never add a `client:*` directive unless the component needs interaction; prefer `client:visible`.
- Never render content without its collection schema; add fields to the schema first.
- Use `<Image />` from `astro:assets` for every content image, always with `alt`.
- Every new page uses a layout and the `Seo` component.
- Keep pages free of data logic: queries live in `lib/`.
- Do not introduce an SSR adapter unless a feature truly needs per-request rendering.
- Self-host fonts and assets; no third-party requests on page load without a reason.
- Changing a URL requires a redirect entry.
- Never weaken `tsconfig.json` (turning off `strict` or a strict flag) to make a change compile: fix the types.
- Never use `any`; use `unknown` and narrow it, or write the type.
- Never add `@ts-ignore`; `@ts-expect-error` only with a one-line reason.
- Run `biome check --write .` before finishing; never commit unformatted files.
- Never add ESLint or Prettier next to Biome.
- Never disable a rule inline without `// biome-ignore <rule>: <reason>`.
- Never hardcode a color, font size or radius in a class or style: use a token from `@theme`, or add it there first.
- Never add a second CSS framework or a CSS-in-JS runtime.
- Do not write `@apply` chains to rebuild components in CSS: make a component.
- Never commit secrets; never add a Node-only dependency to Worker code without checking runtime compatibility.
- Keep Worker bundles small: no heavy dependencies on the request path.
- Never weaken or skip a CI step to make a change pass.
- A new quality gate is added to the Commands table and to `ci.yml` in the same change.
- Never put secrets in workflow files; use repository or environment secrets.
- Never bypass hooks with `--no-verify`.
- Commit messages follow Conventional Commits (`feat(scope): …`, `fix(scope): …`).
- Never pin a dependency to an old version to silence Renovate without a comment saying why.
- Never mix a dependency update with feature changes in one commit.

## Engineering principles

Rules, not suggestions: every change follows them, and a review checks them. When one has to be broken, say so in the change and why.

### Accessibility

- **WCAG 2.2 AA** is the minimum bar for every screen, not a later phase.
- **Semantic elements first**: `button` for actions, `a` for navigation, headings in order, lists, landmarks; ARIA only when no native element fits.
- **Keyboard**: everything works with the keyboard alone, in a logical tab order, with no traps; custom widgets follow the ARIA Authoring Practices patterns.
- **Visible focus** on every interactive element (never `outline: none` without a replacement); focus moves into dialogs and returns on close.
- **Labels**: every input has a visible label; icon-only buttons have an accessible name; images have alt text (empty for decorative ones).
- **Contrast**: text ≥ 4.5:1 (large text ≥ 3:1), UI components and focus indicators ≥ 3:1; color is never the only signal.
- **Targets** at least 24×24 CSS px (44×44 on touch); content reflows at 320px width and 200% zoom.
- **Motion**: respect `prefers-reduced-motion`; nothing flashes more than 3 times per second; auto-playing content can be paused.
- **Errors** are announced, described in text and tied to their field (`aria-describedby`).
- Review check: axe (or equivalent) reports no violations, the flow was done with keyboard only, and a screen reader announces the new UI meaningfully.

### API design

- **Contract first**: the API is described (OpenAPI, protobuf, GraphQL schema) and reviewed before implementation; code and docs are generated or checked against it.
- **Resources and verbs**: plural nouns (`/orders/{id}/items`), HTTP methods with their semantics, correct status codes (201 + `Location`, 204, 404, 409, 422).
- **Consistent errors** as RFC 9457 problem details (`type`, `title`, `status`, `detail`, field errors); never leak stack traces.
- **Idempotency**: PUT/DELETE are idempotent; POST that creates or charges accepts an `Idempotency-Key` and returns the same result on retry.
- **Pagination** on every list (cursor-based for large or changing sets), with a max page size; filtering and sorting via documented query params.
- **Backward compatibility**: add optional fields, never remove or rename fields or change their meaning within a version; breaking changes get a new version and a deprecation period.
- **Versioning** is explicit (`/v1` or a header), one strategy per API.
- **Consistent naming and formats**: one case style for fields, ISO 8601 UTC timestamps, string ids, money as integer minor units plus currency.
- Review check: the contract changed in the same change as the code, and no existing client breaks.

### Clean Architecture

- **Four rings**: entities (enterprise rules) → use cases (application rules) → interface adapters (controllers, presenters, gateways) → frameworks and drivers.
- **Dependency rule**: source code dependencies point inward only; an inner ring never names anything declared in an outer one.
- **One use case per file/class**, named as an action (`PlaceOrder`, `CancelSubscription`), with its own input and output models.
- **DTOs at boundaries**: data crossing a ring is a plain structure defined by the inner ring; entities never leak to controllers, views or the database layer.
- **Gateways are interfaces** declared by use cases and implemented in the adapters ring.
- **Presenters format output** for the delivery mechanism; use cases return data, never HTTP status codes, HTML or JSON.
- **Frameworks are details**: they are plugged in at the outer ring and could be replaced without touching use cases or entities.
- Review check: every new use case has its own file, input/output types and a unit test with fake gateways; no inner file imports an outer package.

### Clean Code

- **Names** reveal intent: a reader knows what a variable holds or a function does without reading its body; no abbreviations, no `data`, `info`, `tmp`, `manager`, `helper`.
- **Small functions**: one thing, one level of abstraction; ~30 lines is a smell, ~60 is a split. At most 3-4 parameters; more becomes an options/params type.
- **Guard clauses**: handle invalid cases first and return early; nesting deeper than 3 levels is refactored.
- **No surprises**: a function named like a query does not mutate; side effects are visible in the name (`save`, `send`, `delete`).
- **No magic values**: numbers and strings with meaning become named constants or configuration.
- **Comments explain why**, never what: the code says what. No commented-out code, no journal comments, no stale TODOs.
- **DRY with judgment**: remove duplicated knowledge, not similar-looking code; wait for the third occurrence before abstracting.
- **Boolean flags** that switch a function's behaviour become two functions.
- Review check: every new name reads as a sentence in its call site; no function in the diff exceeds the limits above without a reason in the change.

### Error handling

- **Never swallow**: every error is handled, returned or logged-and-escalated exactly once; empty catch blocks and ignored results are bugs.
- **Wrap with context**: add what was being done (`load order 42: …`) while keeping the original cause inspectable (wrapping, `cause`).
- **Domain errors are types/values** (`ErrOrderNotFound`, `InsufficientFunds`) declared in the core; infrastructure errors stay in adapters and are translated.
- **Map at the boundary, once**: one place turns errors into HTTP status, exit codes or UI messages; no status codes inside business logic.
- **Fail fast at startup**: missing or invalid configuration stops the process with a clear message instead of failing on first use.
- **No exceptions/panics for control flow**: expected outcomes (not found, invalid input) are values; panics only for programmer errors.
- **User-safe messages**: users see what happened and what to do; stack traces, SQL and internal ids go only to logs.
- **Log where handled**, not at every layer: one log entry per failure, with its context and correlation id.
- **Retries** only for transient errors, with backoff, jitter and a limit; never retry non-idempotent operations blindly.
- Review check: no new code path drops an error; every new error type is mapped at the boundary.

### Hexagonal architecture

- **The core** (domain + application) contains business rules and knows nothing about HTTP, databases, queues, frameworks, ORMs or the UI.
- **Ports are owned by the core**: interfaces declared where they are used (`OrderRepository`, `PaymentGateway`, `Clock`), named in business terms, never after a technology.
- **Adapters live at the edge**: driving adapters (HTTP handlers, CLI, consumers) call use cases; driven adapters (Postgres, Stripe, SMTP) implement ports.
- **Dependency rule**: adapters → application → domain. The core never imports an adapter, a driver or a framework package.
- **No framework types in the core**: no request/response objects, ORM entities, annotations or SDK types cross into it; adapters map to and from core types.
- **One composition root** (`main`/bootstrap) wires concrete adapters into the core; nothing else instantiates infrastructure.
- **Tests through ports**: use cases are tested with in-memory fakes of their ports; adapters get their own integration tests against the real technology.
- Review check: grep the core for driver, framework and SDK imports: there are none; every new adapter implements a port declared in the core.

### One file, one responsibility

- **One file = one responsibility**: one entity, one use case, one handler group, one component. If its description needs "and", it is two files.
- **Size limits**: ~300 lines is a soft limit, ~500 a hard one; a file over it is split by responsibility, not by line count.
- **Folders by feature**, not by technical type: `orders/` holds its entity, use cases, adapters and tests; shared kernels stay small and explicit.
- **Explicit public surface**: each module exposes a small API (index/exports/package-level types); everything else is private and may change freely.
- **No dumping grounds**: no `utils`, `helpers`, `common`, `misc` files; a helper lives next to its only user or in a module named for what it does.
- **High cohesion, low coupling**: things that change together live together; modules talk through interfaces or events, never through each other's internals.
- **Replaceable modules**: deleting or swapping a module touches its folder and the composition root, nothing else.
- **No cycles**: module dependencies form a DAG; a cycle is broken by extracting the shared concept or inverting a dependency.
- Review check: each new file can be described in one sentence; no import reaches into another module's private files.

### Performance

- **Measure first**: optimize only with a profile, benchmark or production metric that shows the problem; record the before and after numbers.
- **Budgets**: explicit targets (p95 latency per endpoint, bundle size, startup time, memory) checked in CI or monitoring.
- **No N+1**: data for a list is loaded in one query or a batch (joins, `IN`, dataloaders); queries inside loops are bugs.
- **Bounded work**: every list is paginated, large payloads are streamed, unbounded reads (whole tables, whole files) are not allowed.
- **Indexes** match the queries; every new query is checked with its plan on realistic data.
- **Caching** has an owner, a key, a TTL and an invalidation strategy; never cache without knowing how it becomes stale.
- **Timeouts everywhere**: every network call, query and lock has a timeout and cancellation propagates (context, abort signals).
- **Async for slow work**: emails, reports and third-party calls that the user need not wait for go to a queue.
- **No premature optimization**: clear code first; micro-optimizations need a measurement that justifies the lost readability.
- Review check: no new query in a loop, no unbounded list, no network call without a timeout.

### Security

- **Validate at every boundary**: input from users, APIs, files and queues is parsed into typed values with allowlists, size and range limits; reject, never sanitize-and-hope.
- **Injection**: parameterized queries and safe APIs only; never build SQL, shell commands, paths or HTML by string concatenation with input.
- **Authorization on every request**: check that this user may do this action on this resource (object-level), server-side, deny by default.
- **Authentication**: proven libraries, hashed passwords (argon2id/bcrypt), short-lived tokens, secure cookies (`HttpOnly`, `Secure`, `SameSite`), CSRF protection for cookie sessions.
- **Secrets** never in code, logs, URLs or the repository; they come from the environment or a secret manager and are rotatable.
- **Least privilege**: database users, service accounts, tokens and containers get only the permissions they need.
- **Output encoding** by context (HTML, attribute, URL, JS); security headers (CSP, HSTS) on web apps.
- **No PII or secrets in logs**; personal data is minimized, encrypted in transit (TLS) and at rest where required.
- **Dependencies** are pinned and scanned (Dependabot, `npm audit`, `govulncheck`, `cargo audit`); known-vulnerable versions block the build.
- Review check: every new endpoint has an authorization check and input validation; no new string-built query or command.

### SOLID

- **Single responsibility**: a module, type or function has one reason to change. If describing it needs "and", split it.
- **Open/closed**: add behaviour by adding code (a new implementation, a new strategy, a new handler), not by growing `switch`/`if` chains in existing code.
- **Liskov substitution**: every implementation of an interface honours its full contract (inputs, outputs, errors, side effects); no implementation panics or ignores a method it "does not support".
- **Interface segregation**: interfaces are small and owned by the consumer; a consumer never depends on methods it does not call.
- **Dependency inversion**: business code depends on interfaces it defines; concrete adapters (DB, HTTP, queues, clocks, random) are injected from the composition root.
- Review check: no constructor creates its own infrastructure; no type takes more than ~5 dependencies (a sign it does too much).

### Testing

- **Pyramid**: many fast unit tests, fewer integration tests against real dependencies (containers), a few end-to-end tests of critical flows.
- **Test behaviour, not implementation**: assert on outputs and observable effects through public APIs; refactoring must not break tests.
- **Arrange, Act, Assert**: one behaviour per test, named after it (`rejects_order_without_items`); table-driven for variations.
- **Deterministic**: no `sleep`, no real clock, randomness or network in unit tests; inject clocks, id generators and seeds.
- **Fakes over mocks** for ports you own (in-memory repository); mocks only to assert interactions that are the behaviour (an email was sent).
- **Isolated**: tests do not depend on order or shared state; each creates its data and cleans up (transactions rolled back, temp dirs).
- **Every bug gets a regression test** that fails before the fix and passes after it.
- **Coverage is a signal, not a target**: uncovered critical paths matter; chasing a percentage with trivial tests does not.
- Review check: every changed behaviour has a test in the same change; the suite passes repeatedly and in parallel.
