# DESIGN.md: Shopify Polaris

Polaris is the design system of the Shopify admin. Source of truth: polaris.shopify.com. Values come from
`@shopify/polaris-tokens` as CSS custom properties (`--p-color-bg-surface`, `--p-space-400`); components from `@shopify/polaris`.

## Principles

- **Merchants first**: every screen helps a merchant finish a task; clarity beats delight.
- **Efficient**: dense information, predictable layouts, keyboard friendly.
- **Consistent**: the same pattern solves the same problem everywhere in the admin.
- **Tokens everywhere**: color, space, radius, shadow and motion are tokens, never literals.
- **Accessible and inclusive**: WCAG 2.1 AA, plain language.

## Color

| Token                            | Light     | Use                 |
| -------------------------------- | --------- | ------------------- |
| `--p-color-bg`                   | `#F1F1F1` | Page background     |
| `--p-color-bg-surface`           | `#FFFFFF` | Cards               |
| `--p-color-bg-surface-secondary` | `#F7F7F7` | Nested areas        |
| `--p-color-bg-surface-hover`     | `#F7F7F7` | Hover on surfaces   |
| `--p-color-bg-fill-brand`        | `#303030` | Primary buttons     |
| `--p-color-text`                 | `#303030` | Body text           |
| `--p-color-text-secondary`       | `#616161` | Secondary text      |
| `--p-color-text-disabled`        | `#B5B5B5` | Disabled            |
| `--p-color-text-link`            | `#005BD3` | Links               |
| `--p-color-text-critical`        | `#8E0B21` | Errors              |
| `--p-color-bg-fill-critical`     | `#C70A24` | Destructive buttons |
| `--p-color-bg-fill-success`      | `#29845A` | Success badges      |
| `--p-color-bg-fill-warning`      | `#FFB800` | Warning badges      |
| `--p-color-border`               | `#E3E3E3` | Dividers            |
| `--p-color-border-focus`         | `#005BD3` | Focus rings         |

- The admin is light-first; dark surfaces exist for specific contexts (`--p-color-bg-inverse` `#1A1A1A`). A full dark mode is not standard (approx. support): plan dark only if the product needs it.
- Tones: `info`, `success`, `warning`, `critical`, `caution`, `magic` (AI features) each with fill, surface and text tokens.
- Every token has a light and a dark value; the app follows `prefers-color-scheme` (or the OS setting) and offers a manual Light / Dark / System switch.
- Dark is not inverted light: surfaces get lighter as they rise, saturated colors are toned down (lower chroma) to avoid glare.
- Keep the preset's palette; the brand color (one hex, TODO) replaces `primary`/`accent`.
- Tints and shades in OKLCH: same hue, lightness steps 98, 95, 90, 80, 70, 60, 50, 40, 30, 20, 15% with chroma reduced near the extremes; each step checked for contrast with its `on-` color.
- Neutrals take a trace of the brand hue (chroma ≤ 0.01) so greys feel related.
- These values replace the base palette's for the same roles; contrast pairs are checked again after the swap.
- Neon accents: magenta `#FF2BD6`, cyan `#00F0FF`, violet `#9D4EDD` on near-black `#0B0612`.
- Success/danger pairs never rely on red vs green alone: add icons (`✓`, `✕`), labels or patterns; charts use a color-blind safe set (e.g. Okabe-Ito: `#E69F00`, `#56B4E9`, `#009E73`, `#F0E442`, `#0072B2`, `#D55E00`, `#CC79A7`).

## Typography

Font: Inter (via `--p-font-family-sans`, system fallback); mono: `--p-font-family-mono`.

| Variant      | Size / line height | Weight | Use                    |
| ------------ | ------------------ | ------ | ---------------------- |
| `heading3xl` | 36 / 48            | 700    | Rare hero numbers      |
| `heading2xl` | 30 / 40            | 700    | Page title (marketing) |
| `headingXl`  | 24 / 32            | 700    | Large titles           |
| `headingLg`  | 20 / 24            | 650    | Page title (admin)     |
| `headingMd`  | 14 / 20            | 650    | Card title             |
| `headingSm`  | 13 / 20            | 650    | Section title          |
| `bodyLg`     | 14 / 20            | 450    | Emphasized body        |
| `bodyMd`     | 13 / 20            | 450    | Default body           |
| `bodySm`     | 12 / 16            | 450    | Help text              |

Weights 450/650 are Inter variable weights (approx. elsewhere: 400/600). Numbers in tables use `numeric` (tabular).

## Spacing and layout

- 4px base: `--p-space-050` 2, `100` 4, `150` 6, `200` 8, `300` 12, `400` 16, `500` 20, `600` 24, `800` 32, `1000` 40, `1200` 48, `1600` 64.
- Page: `Page` component with max width 998px (default) or full width; `Layout` sections one-half/one-third/two-thirds.
- Breakpoints: xs 0, sm 490, md 768, lg 1040, xl 1440px.
- Card padding 16px (`400`) mobile, 20px desktop (approx.).
- Minimum window 800×600; layouts reflow from one to three panes (sidebar, list, detail) as the window grows; splitters remember their width.
- Respect the OS title bar and window controls (left on macOS, right on Windows/Linux).
- Respect safe areas (notch, home indicator, status bar): content padded by the platform insets, backgrounds may bleed under them.
- Phone first (360-430 pt wide), tablet layouts at ≥ 600 pt use two panes (list-detail).
- Primary actions in the thumb zone: the lower half of the screen.
- Mobile first: design at 360 px, then adapt at `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536` px.
- Fluid type and spacing with `clamp()` between the smallest and largest breakpoint (e.g. body `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)`).
- Components adapt to their container with container queries (`@container`), not to the viewport.
- Content measure 60-75 characters; the page never scrolls sideways at 320 px.
- 8 px grid (4 px for fine adjustments), rows 44-48 px, controls 36-40 px high, body text 15-16 px.
- Sections separated by 24-32 px; cards with 16-24 px padding.

## Shape and elevation

| Token                    | Value  | Use             |
| ------------------------ | ------ | --------------- |
| `--p-border-radius-100`  | 4px    | Small controls  |
| `--p-border-radius-200`  | 8px    | Buttons, inputs |
| `--p-border-radius-300`  | 12px   | Cards           |
| `--p-border-radius-400`  | 16px   | Modals          |
| `--p-border-radius-full` | 9999px | Pills, avatars  |

Shadows: `--p-shadow-100` (cards), `--p-shadow-200`… `--p-shadow-600` (popovers, modals); buttons use a subtle bevel shadow (`--p-shadow-button`).

- Glass surfaces: `background: color-mix(in oklch, var(--surface) 60%, transparent)`, `backdrop-filter: blur(16px) saturate(140%)`, 1 px border `rgb(255 255 255 / 0.18)` (dark) or `rgb(0 0 0 / 0.08)` (light).
- Only on floating layers (navigation, sheets, popovers), never stacked more than two deep.
- GUI glow: `box-shadow: 0 0 6px var(--accent), 0 0 18px color-mix(in oklch, var(--accent) 50%, transparent)` on focus and primary elements only.
- TUI: bright ANSI colors (`13`, `14`) and bold for the glowing elements; everything else stays dim.

## Motion

- Durations: `--p-motion-duration-100` 100ms, `150` 150ms, `200` 200ms, `250` 250ms, `300` 300ms, `500` 500ms.
- Easing: `--p-motion-ease` `cubic-bezier(0.25, 0.1, 0.25, 1)`, `--p-motion-ease-in`, `--p-motion-ease-out`, `--p-motion-ease-in-out`.
- Keyframes tokens for spin, appear, fade; motion is functional (feedback, orientation), never ornamental.
- `prefers-reduced-motion`: no movement, fades only.
- Durations: 120 ms (hover, press), 200 ms (enter/leave of small elements), 280 ms (panels, dialogs); exits 30% shorter than entries.
- Easing: `cubic-bezier(0.2, 0, 0, 1)` for entering, `cubic-bezier(0.4, 0, 1, 1)` for leaving; movement ≤ 8 px, mostly opacity.
- Only `opacity` and `transform` animate; never layout properties.

## Components

- **Buttons**: `variant="primary"` (one per card/page), secondary (default), `tertiary`, `plain`; `tone="critical"` for destructive.
- **Cards** group related content; `BlockStack`/`InlineStack` with `gap` tokens for layout inside.
- **IndexTable / DataTable** for resources: bulk actions, filters, sticky header, pagination.
- **Forms**: `FormLayout`, `TextField` with label, help text, inline error; `ContextualSaveBar` for unsaved changes.
- **Feedback**: `Toast` for short confirmations, `Banner` for persistent messages, `Badge` for status.
- **Empty / loading / error**: `EmptyState` with illustration and one action; `SkeletonPage` while loading.
- A menu bar (or app menu) lists every command with its shortcut; context menus on right click.
- Every action has a keyboard shortcut following the platform (`Cmd` on macOS, `Ctrl` elsewhere); a command palette (`Cmd/Ctrl+K`) finds any command.
- Pointer states: hover, pressed, focus ring, and the right cursor (pointer, text, resize).
- Bottom navigation with 3-5 destinations; back follows the platform (swipe on iOS, system back on Android).
- Touch targets at least 44×44 pt (iOS) / 48×48 dp (Android), 8 pt apart.
- Gestures (swipe to delete, pull to refresh) always have a visible alternative.
- Haptics only to confirm meaningful actions (success, selection, error), never on scroll.
- Navigation collapses to a menu button below `md`; tables become stacked cards or scroll inside their own container.
- Hover is an enhancement: every action works with touch and keyboard (`@media (hover: hover)` for hover-only styles).
- GUI: auth screens are a single centered card, max 400 px, logo on top, one heading ("Sign in to Acme"), no navigation chrome; primary button full width, 44 px high.
- GUI: sign in: email, password with a show/hide toggle, "Forgot password?" link under the password, "Sign in" button; allow browser autofill and password managers (`autocomplete="username"`, `current-password`, `new-password`, `one-time-code`).
- GUI: social sign-in buttons (Continue with Google, Apple) are outlined, full width, above or below an "or" divider, same height as the primary button; follow each provider's brand guidelines for logo and label.
- GUI: failed login says "Email or password is incorrect" for any credential error; reset requests always answer "If an account exists, we sent a link" so account existence never leaks; rate-limit and show "Too many attempts. Try again in 5 minutes."
- GUI: sign up asks the minimum (email and password, or social); show password rules as a live checklist while typing and prefer length (12 or more characters) over composition rules; confirm password fields are not needed with a show toggle.
- GUI: verification: a 6-digit code as one input with `inputmode="numeric"`, auto-advance and paste support, "Resend code" disabled for 30 s with a visible countdown, and an "Use a different email" link.
- GUI: 2FA: prompt for the code, offer "Use a recovery code" and "Remember this device for 30 days"; show recovery codes once at setup with copy and download actions and a required "I saved them" checkbox.
- GUI: reset flow: email, then link, then a new password screen with the same rules; after success sign in automatically or go to sign in with a clear "Password updated" message; links expire and expired ones say so with a request-new-link action.
- GUI: after sign in return the user to the page they came from; sessions expire with a re-auth dialog that keeps unsaved work.
- TUI: prompts for user and password with input hidden (no echo, no asterisks needed), device-code flow prints the URL and code in a box and polls with a spinner; tokens are stored in the OS keychain, never printed.
- GUI: comment item: 32 px avatar, author name (medium weight), relative time ("2h ago", full timestamp on hover), body text at 14-15 px, actions row below (Reply, React, "..." menu); items separated by 16-24 px, not boxed.
- GUI: replies nest one level only, indented 40 px with a thin left rule; deeper replies attach to the same thread with an "@name" prefix; long threads collapse to "Show 6 more replies".
- GUI: composer sits at the bottom of the list or inline under the item being replied to; starts as a single-line field and grows up to 8 lines; the Send button is disabled when empty and the shortcut Cmd/Ctrl+Enter sends; Esc with text asks before discarding.
- GUI: mentions: typing "@" opens a list of people (max 6, avatar and name, filtered as typed), Enter or Tab inserts a chip; mentioned people are notified once; nonmembers cannot be mentioned without a warning.
- GUI: posting is optimistic: the comment appears at once with a muted "Sending..." state; on failure it stays with "Not sent. Retry" and the text is never lost.
- GUI: edit: the body becomes a composer prefilled with the text, "Save" and "Cancel"; edited comments show "(edited)"; delete asks for confirmation and, when it has replies, keeps a "Comment deleted" placeholder so the thread stays readable.
- GUI: permissions: authors edit and delete their own, moderators any; disabled actions are hidden rather than shown disabled; closed or locked threads show a notice instead of the composer.
- GUI: empty: "No comments yet. Start the discussion." with the composer focused-ready; loading shows 3 skeleton items; new comments arriving live show a "New comments" pill rather than shifting the viewport.
- TUI: comments as indented blocks with `author  time` headers, `r` replies, `e` edits, `d` deletes with a confirmation, the composer opens in `$EDITOR` for multi-line text.
- Every empty state has three parts at most: a short title, one sentence of explanation, one primary action. No lorem, no jokes, no more than 2 lines of body.
- GUI: first-use: title names what will live here ("No projects yet"), the sentence says the benefit, the button creates the first one ("Create project"); a secondary text link to docs or import is allowed.
- GUI: no-results (search or filters): echo the query ("No results for "invoice 99""), suggest one fix ("Check spelling or clear filters") and offer "Clear filters" as the action.
- GUI: error: say what failed in plain words, keep the cause short, offer "Try again" as the primary action and keep any cached content visible if it exists.
- GUI: no-permission: say what is blocked and who can grant it ("Ask an admin for access"), with a "Request access" action when the product supports it; never show a bare 403.
- GUI: illustration is optional: a single flat 96-128 px spot illustration or icon in muted tones, centered above the title; inside small panels (under 240 px high) use the icon only or nothing.
- GUI: center the block in the container both ways; max width 360 px; a list or table keeps its header visible above the empty state.
- TUI: a centered dim block of 1-3 lines with the key hint in brackets: `No sessions yet. Press n to create one.`; no ASCII art.
- GUI: label above the field, always visible (never placeholder-only); helper text below in muted text; field height 40 px, 16 px between fields, one column unless fields are short and related (city + postcode).
- GUI: mark the exception, not the rule: if most fields are required, label the optional ones "(optional)"; otherwise mark required ones with "*" plus a legend at the top.
- GUI: validate on blur, then on every change once a field has shown an error; never show an error while the user is still typing the first time. Clear the error the moment the value becomes valid.
- GUI: error text sits under the field in danger color with an icon, and says what to do: "Enter an email like name@example.com", not "Invalid input".
- GUI: submit button keeps its label and shows a spinner inside while sending, with the width fixed; it is disabled only while sending, never because the form is incomplete (explain the missing fields on submit instead).
- GUI: on submit with errors, focus the first invalid field and show a summary above the form linking to each error when there are 3 or more.
- GUI: autosave forms show "Saving..." then "Saved" in a small status line, never a toast per keystroke; debounce 800 ms and save on blur.
- TUI: one field per line as `Label  [value____]`, the focused field highlighted; Tab / Shift+Tab move between fields, Enter submits on the last field, Esc cancels with a confirmation if the form is dirty.
- TUI: errors appear on the line below the field in danger color, prefixed with `!`; the status line shows "N errors" while any remain.
- GUI: a bell icon button in the top bar, 40 px target, with a badge showing the unread count (cap at "99+"); a dot instead of a number when counts are not meaningful; the badge clears per item as read, not all at once on open.
- GUI: clicking opens a popover (400 px wide, max 560 px high) on wide screens or a full screen on narrow ones; header "Notifications" with "Mark all as read" and a settings icon; tabs "All" and "Unread" with counts.
- GUI: each item: actor avatar, one-line sentence with the bold object ("Ana commented on Roadmap"), a 2-line preview at most, relative time, an unread dot and tinted surface; clicking marks it read and goes to the exact place; a "..." menu offers Mark as unread, Mute thread, Delete.
- GUI: group by day (Today, Yesterday, Earlier) and collapse bursts of the same kind ("5 people reacted to your post"); important items (mentions, approvals, failures) are not collapsed or muted by defaults.
- GUI: new notifications arriving live update the badge and prepend without moving what the user is reading; do not play sounds or show desktop alerts unless the user has opted in.
- GUI: empty state: "You are all caught up" with a link to preferences; loading shows 5 skeleton rows; load more on scroll with a page size of 20 and a retention window stated ("Showing the last 30 days").
- GUI: preferences are a matrix of event type by channel (In-app, Email, Push) with toggles, an email digest option (instant, daily, weekly), quiet hours, and a per-project override; sensible defaults: only direct events are on by default.
- GUI: unsubscribe links in emails work in one click without login and say exactly what will stop.
- TUI: a status-line counter `3 unread`, `N` opens the list, `Enter` opens the item, `m` marks read, `M` marks all, `x` dismisses; no popups interrupting typing.
- Get to the first useful result in the fewest steps: ask only what the product cannot work without (3 steps or fewer); everything else is asked later in context.
- GUI: a multi-step flow shows "Step 2 of 4" with a progress bar at the top; each step has one question, one primary button ("Continue") and a "Skip" text button when the step is optional; "Back" always works and keeps answers.
- GUI: a setup checklist (3-6 items) lives on the home screen in a card: each item is a verb ("Invite a teammate"), shows done state with a check, links straight to where it is done, and the card can be dismissed and reopened from the help menu.
- GUI: progress persists on the server per user; closing the app mid-flow resumes at the last step with "Pick up where you left off".
- GUI: tooltips or coach marks are limited to 1 at a time, anchored to the element, 3 steps maximum per tour, with "Next", "Skip tour" and a dot indicator; never block the interface behind a full-screen overlay.
- GUI: prefer sample data or a prefilled template over empty screens; mark sample data clearly and make it removable in one action.
- GUI: reveal advanced features progressively: show them when the user first needs them, with a one-line hint the first time only.
- TUI: first run prints a short welcome with the 3 keys that matter (`?` help, `:` commands, `q` quit) and a prompt to continue; a `--no-intro` flag or saved flag skips it forever.
- TUI: setup questions are prompts with a visible default in brackets; Enter accepts it; Ctrl+C aborts without writing partial config.
- GUI: search box 40 px with a leading search icon, placeholder naming what is searched ("Search invoices"), a clear button when it has text, and "/" as the focus shortcut; search runs as the user types after a 250 ms debounce, or on Enter for expensive queries.
- GUI: filters sit in a row above the results as chips (`Status: Open  v`); a chip opens a popover with the options and an "Apply" or instant behavior chosen per screen and kept consistent; more than 5 filters go behind a "Filters" button into a side panel.
- GUI: an applied-filters bar shows every active filter as a removable chip (x), the result count ("128 results"), and one "Clear all" link; the bar is absent when nothing is applied.
- GUI: sort is a separate dropdown labelled with the current choice ("Sort: Newest"); the default sort is named, and relevance is the default only when a query exists.
- GUI: search and filters live in the URL so a view can be shared, reloaded, and reached with Back; changing a filter resets pagination to page 1.
- GUI: saved views: "Save view" captures filters, sort and columns under a name; views appear as tabs or a menu, a modified view shows "Modified" with "Save" and "Reset".
- GUI: no results keeps the controls in place, echoes the query and active filters, and offers "Clear filters" (see empty states); a typo suggestion ("Did you mean ...") is shown when available.
- GUI: while loading, keep the previous results visible, dimmed, with a thin progress bar; never flash an empty list between queries.
- TUI: `/` opens an inline prompt, results filter live, `n/N` jump between matches, Esc clears the query; active filters are shown in the header line as `[status:open] [owner:me]` and `f` edits them.
- GUI: group settings into 4-7 sections by what the user is trying to do (Profile, Notifications, Security, Billing), not by technical area; the section list is a left column on wide screens and a list screen on narrow ones.
- GUI: each setting is a row: label (medium weight) and one line of helper text on the left, the control on the right; rows 56 px minimum, dividers between rows, section titles as small headings.
- GUI: toggles and selects apply instantly and confirm with a quiet "Saved" near the control; text inputs and anything with side effects use an explicit "Save" button with "Cancel", shown only when the form is dirty.
- GUI: never mix instant and saved controls inside one card; if a section must, label the saved part with its own button.
- GUI: show the effective value when a setting is inherited ("Using workspace default: English") with a "Reset to default" link per setting.
- GUI: settings search at the top of the screen filters rows by label and helper text, highlights matches, jumps to the section, and shows "No settings match "x"" when empty.
- GUI: danger zone is the last section, separated by a divider, titled "Danger zone", rows with danger-outlined buttons ("Delete workspace"); each action opens a confirmation that requires typing the resource name.
- TUI: a two-pane list: sections on the left, rows on the right as `label  value`; Enter edits, Space toggles, `/` searches, `r` resets the row to default; changes marked with `*` until saved with `w`.
- Pick by scope: inline message for one field or one block; toast for the result of an action the user just took; banner for a persistent state that affects the whole page or account (offline, expired plan, maintenance).
- GUI: toast: bottom-left (or bottom-center on mobile), 360 px max width, surface color with a status icon, one sentence plus at most one action ("Undo", "View"); never put a long explanation or a form inside.
- GUI: toast duration: 4 s for success, 8 s when it has an action, errors stay until dismissed; pause the timer on hover and focus; always include a close button.
- GUI: stack at most 3 toasts, newest at the bottom, 8 px gap; extra ones queue; identical messages merge into one with a count instead of repeating.
- GUI: undo over confirm for reversible actions: perform at once, toast "Moved to trash Undo" for 8 s, then commit; keep the undo available if the user navigates within the app.
- GUI: banner: full width under the top bar, 48 px, status tint with icon, message, one action and a close button when dismissible; a blocking problem (offline, payment failed) is not dismissible and clears itself when resolved.
- GUI: inline success is a check and "Saved" text next to the control for 2 s; inline errors stay until fixed.
- GUI: write messages as result then next step: "Invoice sent to ana@example.com", "Could not save. Check your connection and try again."; no "Success!" alone.
- TUI: a single status line at the bottom: info in dim text for 4 s, errors in danger color until the next key press; critical failures print a full message above the prompt.

## Accessibility

- Text and fill tokens meet 4.5:1; never put `text-secondary` on `bg-fill` colors.
- Focus: visible 2px focus ring (`--p-color-border-focus`) on all controls.
- Labels on every field (visually hidden only with `labelHidden`, never removed).
- Keyboard: every action reachable; IndexTable supports keyboard selection.
- Status uses Badge text and tone, not color alone.
- Text on glass keeps 4.5:1 against the worst background behind it; with `prefers-reduced-transparency` or no `backdrop-filter` support, surfaces become solid.
- Glow never carries meaning on its own; it is off in high contrast and reduced-transparency modes.
- Every screen is checked with a color-blindness simulator (deuteranopia, protanopia, tritanopia) before it is done.
- With `prefers-reduced-motion: reduce` (or the OS/app setting), movement is replaced by ≤ 150 ms opacity fades; parallax, auto-playing animation and spinners that move across the screen are removed.
- GUI: semantic HTML/native controls first, landmarks, headings in order, every control named, live regions for async updates; tested with VoiceOver and NVDA/TalkBack.
- TUI: an accessible mode (flag or env var) prints linear text without box art, spinners or cursor tricks, one line per state change, readable by screen readers.
- Text contrast at least 7:1 (4.5:1 for large text), targets at least 44×44 px, no timing that cannot be extended, no flashing at all.
- Line height ≥ 1.5, paragraph spacing ≥ 2× font size, measure ≤ 80 characters, text resizable to 200% without loss.
- Context help for every non-obvious input; error messages say how to fix the problem.
- Errors are announced and linked to fields; the code input is labelled with its length; never use CAPTCHA without an accessible alternative.
- The list is a landmark with a heading and count; a new comment is announced politely; the mention popup is a combobox; icon-only actions have names that include the author ("Reply to Ana").
- The title is a real heading; the empty state is announced when it replaces content (`role="status"`); the action is reachable by keyboard and is the first focusable element in the region.
- Every input has a programmatically associated label; errors are linked with `aria-describedby` and announced with `aria-live="polite"`; invalid fields set `aria-invalid`.
- Use the right input `type` and `autocomplete` token so password managers and mobile keyboards work; never block paste.
- The bell button name includes the count ("Notifications, 3 unread"); the list uses semantic lists; new items are announced politely and rate-limited so a burst is one announcement.
- Tours and flows are fully keyboard operable, focus moves to each new step's heading, and nothing auto-advances on a timer.
- Search is a `role="search"` landmark; announce the result count in a polite live region after each update; filter chips are buttons with names like "Remove filter Status: Open".
- Toggles are `role="switch"` with the label and state announced; sections are landmarks with headings; the search field is labelled and results count is announced.
- Toasts live in a `role="status"` region (`role="alert"` for errors) and must not steal focus; the action is reachable by keyboard; important messages are never toast-only.

## Rules for agents

- Use `@shopify/polaris` components inside `AppProvider` with the i18n translations; do not restyle them with custom CSS.
- Layout with `Page`, `Layout`, `Card`, `BlockStack`, `InlineStack`, `Box` and space tokens; no custom margins.
- Raw CSS (rare) uses `var(--p-…)` tokens from `@shopify/polaris-tokens`; never hex values.
- One primary action per page in `Page primaryAction`; secondary actions in `secondaryActions`.
- Destructive actions: `tone="critical"` plus a confirmation `Modal`.
- Copy follows Polaris content guidelines: sentence case, verbs on buttons, no jargon.
- Never require the mouse: every flow works with the keyboard alone, with visible focus.
- Persist window size, position and pane widths between sessions.
- Use the platform's text scaling (Dynamic Type / font scale) and test at the largest setting.
- Never place interactive elements under the status bar or the home indicator.
- Test every screen at 360, 768, 1280 and 1920 px wide and at 200% browser zoom.
- Use relative units (`rem`, `%`, `ch`) for sizes; `px` only for borders and hairlines.
- Never write a color that only exists in one theme; test every screen in both before it is done.
- Reuse the duration and easing tokens; no ad-hoc timings.
- Use `@supports (backdrop-filter: blur(1px))` for the glass styles and keep the solid version as the default.
- Every animation is behind the motion preference check; test with it on.
- Never convey state only visually; every icon-only control has an accessible name.
- Never reveal whether an email, username or phone is registered.
- Never put the password, token or code in a URL, a log or a toast.
- Never lose a draft: keep it per thread until sent or explicitly discarded.
- Escape user content; render links and mentions from parsed data, never raw HTML.
- One primary action per empty state, never two equal buttons.
- Distinguish "nothing exists", "nothing matches", "failed to load" and "not allowed"; never reuse one message for all.
- Copy is written in the product voice, active and specific: no "Oops", no "Nothing to see here".
- Never clear what the user typed after a failed submit or a server error.
- Never disable the submit button for validation; only for the in-flight request.
- Every form defines its empty, filled, error, sending and success states.
- Every notification links to what caused it and is actionable or informational, never both vague and urgent.
- Never notify the actor about their own action.
- Every onboarding step is skippable or has a sensible default, except account basics.
- Never show the same hint twice once dismissed; store dismissal per user.
- Never ask for permissions (notifications, location, camera) before the moment the feature needs them, and explain why first.
- Never reset the user's filters when they open and leave a detail view.
- Count and label every applied filter; an invisible filter is a bug.
- Every setting states its default and can be reset to it.
- Never apply a destructive or billing change instantly.
- Never hide a setting that is on by default from enterprise or admin users without saying who controls it.
- Never use a toast for something the user must act on before continuing.
- Never auto-dismiss an error or a message with a destructive consequence.
- A component reads tokens (`var(--color-accent)`); a new value goes into `tokens.css` first.
- Class names follow one scheme (BEM or one class per component); no IDs for styling.

## Toolkit

| Design | CSS |
| Color token | a custom property on `:root` (`--color-surface`, `--color-text-muted`…); dark values on `[data-theme=dark]` |
| Type scale | `--font-size-<step>` with `clamp()` where the design is fluid; `--font-<family>` |
| Spacing | `--space-<step>` on a 4 px base; components use only these |
| Radius / shadow | `--radius-<name>`, `--shadow-<name>` |
| Layout | grid and flex; `max-width` containers; container queries for components that change with their slot |
| Motion | `--duration-<name>`, `--ease-<name>`; everything under `@media (prefers-reduced-motion: no-preference)` |
| Layers | `@layer reset, tokens, base, components, utilities;` so order never depends on import order |

- `tokens.css` holds every custom property; no other file declares a raw color, size or duration.
