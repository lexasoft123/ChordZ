# Plan 01 — ChordZ workspace shell redesign

**Status:** completed; the final audit scored 25/30, up from 16/30.
**Input:** the August 30, 2026 design audit (preserved in Git history).
**Scope:** the shell around the song page — library sidebar, toolbar, details
panel, transport, guitar helper. The design *language* (`@singz/ui`
night-studio) is fixed and not in scope.

Phases are consecutive and self-contained: each names the files it touches, the
patterns to copy, how to prove it worked, and what not to do. Execute in order —
Phase 1 ships upstream and Phase 2 changes the values every later phase uses.

---

## Phase 0 — Discovery (already done; read before starting)

Gathered by reading the built package and the app's own libraries, not assumed.

### Allowed APIs — `@singz/ui` v1.4.0

Verified in `../singz-ui/dist/index.d.ts` and `dist/kit.css`.

**Components:** `Button` (`variant: 'ghost'|'primary'|'danger'`, `size:
'md'|'sm'`, `icon`, `active`, `className`), `Chip` (`active?`, `wide?`),
`SegmentedControl<T>` (`options: {value,label,disabled?,title?}[]`, `value`,
`onChange`), `StatusDot` (`tone: 'ok'|'idle'|'warn'`), `LinkButton`, `Badge`
(`caps?`), `Modal` (`onClose`, `persistent?`, `cardClassName?`, `busy?`,
`aria-label`?), `ModalActions`, `Waveform`, `WindowButtons`.

**Hooks / helpers:** `useModalLock(active?)`, `modalCoversApp()`,
`useDismissable`, `fitCanvas`, `applyPlatformClasses`, `cx`.

**Data:** `tokens`, `atelier`, `cssVar`, `toCss`, `STEM_META`, `CUSTOM_COLORS`,
`STEM_ORDER`.

**CSS classes shipped** (the complete list — anything not here is the app's own
and must be justified):
`.badge` `.badge.plain` `.chip` `.chip.active` `.chip.wide` `.dot(.ok/.idle/.warn)`
`.eyebrow` `.linkish` `.modal-actions` `.modal-body` `.modal-card` `.modal-scrim`
`.modal-title` `.mode-seg` `.no-drag` `.pill(.ghost/.primary/.danger/.small/.gear/.on)`
`.round-ghost` `.slider` `.slider.seek` `.titlebar` `.toast` `.wave*`
`.win-controls`, plus `:where(body)`, `:where(body)::before/::after`,
`:where(.app)` and the scrollbar rules.

**There is no Toast component** — only the `.toast` class. Phase 5 writes a
~20-line host in ChordZ; see the note there about pushing it upstream later.

### Allowed APIs — ChordZ's own libraries

- `src/lib/chordpro.ts:43,186,216` — `parseChordPro(src, id?)`,
  `serializeChordPro(song)`, `collectChords(song)`; types `Song`, `Section`,
  `Line`, `Segment`, `SongMeta`.
- `src/lib/transpose.ts:50,73` — `transposeSong(song, semitones, useFlats?)`,
  `soundingKey(shapeKey, capo)`.
- `src/lib/scales.ts` — `rootToPitchClass`, `noteName`, `preferredAccidental`,
  `scaleBoxes`, `scalePitchClasses`, `scaleNotesInRange`, `SCALES`,
  `STANDARD_TUNING_PC`, types `PitchClass`, `BoxId`, `ScaleTypeId`.
- `src/lib/chords.ts:104` — `lookupChord(symbol): ChordShape | null`.
- `src/platform/bridge.ts:12-18` — `bridge.loadLibrary(): Promise<string|null>`,
  `bridge.saveLibrary(data): Promise<boolean>`,
  `bridge.openAudioFile(): Promise<string|null>`, `bridge.windowControls?`.

### Copy-ready patterns already in this repo

| Need | Copy from |
|---|---|
| A dialog | `src/components/Sidebar.tsx:89-110` (Modal + modal-title/body + ModalActions) |
| A full-bleed mode with its own bar | `src/components/PerformanceOverlay.tsx` |
| A `--p`-driven scrub control | `src/components/Player.tsx:121-136` |
| Token aliasing / palette overrides | `src/styles/tokens.css` |
| A kit-classed control with an app hook | `src/components/Toolbar.tsx:56-71` |

### Anti-patterns (verified absent from the API — do not invent)

- No `Toast`, `Tooltip`, `Popover`, `Drawer`, `Menu` or `Tabs` component exists
  in the kit. Do not import them.
- No `Button variant="secondary"`, no `size="lg"`, no `Chip size` prop.
- `variant="danger"` needs no companion `ghost` as of v1.4.0, but
  `className="danger"` on a default ghost is still valid — do not "fix" existing
  call sites either way.
- Do not add a local light palette; `data-sz-palette="atelier"` ships.
- Do not redeclare `body::before`/`::after` or `.app { z-index }` — the kit owns
  the room as of v1.4.0.

---

## Phase 1 — Upstream: the two fixes that belong in the kit

**Repo:** `../singz-ui` (branch off `v1.4.0-second-consumer`). Ship before
Phase 2 so ChordZ consumes the fixed kit.

**What to implement**

1. `.eyebrow` fails WCAG AA. Measured 3.27:1 at 10px (`--sz-faint` #6b6355 on
   `--sz-bg` #12100d); AA needs 4.5:1 for text this size. Change
   `src/styles/primitives.css` `.eyebrow { color: var(--sz-faint) }` →
   `var(--sz-dim)`, measured 6.10:1. This is one line and fixes every consumer;
   ChordZ has 9 eyebrows and SingZ has more.
2. Gate the kit's own motion. `src/styles/primitives.css` and
   `src/styles/overlays.css` own four keyframes (`pulse`, `fade`, `rise`,
   `toast-in`) and every transition on pill/chip/round-ghost. Add one block at
   the end of `primitives.css`:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```
   The `!important` sweep is the documented technique for this media query and
   is why it belongs in the kit once rather than in every consumer.

**Verification**
- `npm run themeable` → 0 un-tokenised colours.
- `npm run check` → `dist/ is current` (rebuild and commit `dist/`; it is
  checked in on purpose — see the kit README).
- Contrast re-measured in `demo/index.html` under both palettes: `.eyebrow` ≥
  4.5:1 on `--sz-bg` and on `--sz-panel`.
- Toggle OS "Reduce motion" and confirm the demo's modal card no longer rises.

**Anti-pattern guards**
- Do not raise `--sz-faint` itself — it is used for non-text (dot idle,
  hairline-adjacent) and lightening it flattens the palette's third tier.
- Do not add the media query to ChordZ as well; duplicate `!important` sweeps
  are how a reduced-motion rule ends up un-overridable.

---

## Phase 2 — A type scale and a spacing scale that exist

**Files:** `src/styles/tokens.css`, `src/styles/app.css`.

**What to implement**

Add the scales as tokens, then sweep every ChordZ rule onto them. Measured
today: 12 UI type sizes with half-pixel steps, 20 spacing values, no grid.

```css
/* type — six steps, each with a job */
--t-micro: 10px;   /* eyebrow, badge, mono readouts */
--t-ui: 12px;      /* controls, chips, segment labels */
--t-body: 14px;    /* lists, panel values, editor */
--t-lyric: 17px;   /* the song line; scaled by --font-scale */
--t-head: 22px;    /* panel and section headings */
--t-title: 30px;   /* song title */

/* space — 4px grid */
--s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px;
--s-5: 24px; --s-6: 32px; --s-7: 48px;
```

Radii collapse to the three already declared (`--radius-sm/md/lg` = 7/12/18px);
delete the orphan `5px` on `.chord-token`.

**Exemptions, stated so the grep in Phase 7 is honest:** the kit's own
components ship 9.5/11/12/13px and `.chip`'s 26×24 box. ChordZ cannot change
those without overriding kit rules, which the conventions forbid. The scale
governs `src/styles/*.css` only; kit-owned sizes are out of scope and are a
candidate for a later upstream pass.

**Verification**
- `grep -oE "font-size: [0-9.]+px" src/styles/*.css | sort -u` — every value is
  one of the six, or a `calc()` on `--t-lyric`.
- `grep -nE "(padding|margin|gap): [^v]" src/styles/*.css` returns only values
  from the `--s-*` set.
- Re-run the live probe from the audit; UI type sizes ≤ 7 distinct (six plus the
  scaled lyric), spacing values ≤ 9.
- Screenshot the song page before/after at 1320×860 — the change should be
  invisible at a glance. If the page looks different, a value moved that should
  not have.

**Anti-pattern guards**
- Do not introduce `rem`; this is a fixed-size desktop app and the lyric already
  has its own `--font-scale` multiplier.
- Do not override kit component sizes to "complete" the scale.

---

## Phase 3 — Recompose the shell

The heart of the redesign. Three duplicated affordances go, the toolbar loses a
row, and the details panel stops being furniture.

**Files:** `src/components/Toolbar.tsx`, `MetadataPanel.tsx`, `Workspace.tsx`,
`Player.tsx`, `GuitarHelper.tsx`, `src/styles/app.css`, `src/App.tsx` (prefs).

**What to implement**

1. **Toolbar: two rows → one.** Left: title + a read-only meta line
   (`Am · 76 BPM · Capo 2`) replacing the Key/BPM/Capo control groups. Right:
   `SegmentedControl` (Preview/Split/Edit), transpose stepper + ♭/♯ chip,
   `Button variant="primary"` Perform, `Button icon active` details toggle.
   Target height ≤ 56px, down from 137px.
2. **Key / BPM / Capo become editable in one place — the details panel.** They
   are song properties, and the panel is where properties are edited. The
   toolbar shows them; it no longer duplicates their editors
   (`Toolbar.tsx:35-37` vs `MetadataPanel.tsx:32-46`).
3. **Text-size controls move to the details panel** under a "View" section. The
   `⌘+ / ⌘− / ⌘0` shortcuts stay as they are (`App.tsx:107-127`) and remain the
   primary path; the buttons stop occupying the always-visible bar.
4. **Details panel: default closed**, toggled from the toolbar. Persist the flag
   in prefs (`metaOpen`, new field — `loadPrefs` already tolerates missing keys,
   so no version bump).
5. **One helper toggle.** Delete the toolbar chip (`Toolbar.tsx:150-168`); keep
   the transport one (`Player.tsx:66-84`) — it sits with the other while-playing
   controls and adjacent to the panel it opens.
6. **Helper loses its rail and its chord palette.** Chords live in the details
   panel (`MetadataPanel.tsx:84-91`); the helper becomes controls + fretboard.
   Delete `GuitarHelper.tsx:105-131` (rail) and `:144-156` (chord aside), and
   the `showChords` state with them.

**Verification**
- Live probe at 1320×860: song page ≥ **60%** of the window (41.3% today),
  toolbar ≤ 56px, chrome ≤ 40%.
- `grep -rn "onShowHelperChange(!" src/components` returns exactly one line.
- `grep -rn "meta.tempo\|meta.capo" src/components/Toolbar.tsx` returns only
  read-only render sites, no `onChange`.
- Interactive-element count on the default screen drops below 60 (100 today).
- Every removed control is still reachable: transpose/♭♯/Perform/mode in the
  toolbar; key/BPM/capo/tags/chords/text-size in the panel; helper in the
  transport. Walk the list and tick each one.

**Anti-pattern guards**
- Do not build a `Drawer` abstraction. The panel is a conditional render inside
  `workspace-body`, exactly as it is today (`Workspace.tsx:110-128`).
- Do not move the details panel into a modal — it is consulted *while* reading,
  not instead of.
- Do not compensate for the shorter toolbar by enlarging the title.

---

## Phase 4 — The library becomes a keyboard surface

**Files:** `src/components/Sidebar.tsx`, `src/styles/app.css`.

**What to implement**

1. Song rows become real buttons. Today they are `<li onClick>` with no tab stop
   (`Sidebar.tsx:55-72`) — 0 of 4 focusable, so the app's most basic action is
   mouse-only. Keep the `<li>` for list semantics and put a `<button
   className="sidebar-item">` inside it, or set `role="option"` on a
   `role="listbox"` parent with roving `tabIndex`. Prefer the button: it is
   fewer moving parts and the kit's focus ring already covers it.
2. Delete gets a visible affordance: a `.round-ghost` × in the row, revealed on
   `:hover` and on `:focus-within` (never hidden from keyboard users), plus
   `Delete`/`Backspace` on the focused row. Both routes open the existing kit
   `Modal` confirm (`Sidebar.tsx:89-110`) — do not add a second dialog.
3. Keep `onContextMenu` as a third route; it is a shortcut now, not the only way.

**Verification**
- Tab from the search field: every song row is a stop, in list order.
- `Enter`/`Space` selects; `Delete` opens the confirm; `Escape` closes it.
- Live probe: `[...document.querySelectorAll('.sidebar-item')].filter(e =>
  e.tabIndex >= 0).length` equals the song count.
- The × is visible when the row has focus, not only on hover.

**Anti-pattern guards**
- No `tabIndex={0}` on a `<div>` with a click handler — that is the bug, spelled
  differently.
- Do not make the row a `<button>` wrapping another `<button>` (the ×); put the
  × as a sibling inside the `<li>`.

---

## Phase 5 — The three missing states

**Files:** `src/App.tsx`, `src/components/Player.tsx`, `src/components/Sidebar.tsx`,
new `src/components/Toast.tsx`, `src/styles/app.css`.

**What to implement**

1. **Loading.** `App.tsx:63-83` renders sample songs and then swaps in the real
   library — the app shows content that is not yours and then replaces it. Hold
   the workspace until hydration settles: a `hydrating` state, the sidebar
   showing an `.eyebrow` "Loading library…", and samples seeded only when the
   store is genuinely empty.
2. **Error.** Three silent failures today:
   - corrupt library JSON swallowed (`App.tsx:76-78`)
   - `bridge.saveLibrary` returns a boolean that is discarded (`App.tsx:92`)
   - `<audio>` has no `onError` (`Player.tsx:164-172`)
   Each raises a toast. Write `Toast.tsx` around the kit's `.toast` class —
   a fixed-position div, one message, auto-dismiss, `role="status"`. The kit's
   demo copy is the voice to match: "Could not decode that audio file."
3. **Success.** Saving is continuous, so a banner would be noise. Put a
   `StatusDot` in the sidebar footer beside the song count: `ok` when the last
   write succeeded, `warn` while a write is in flight, and pair it with a word —
   the kit's own doc note says the dot alone is not accessible.

**Verification**
- Corrupt the stored library JSON by hand → toast appears, samples are not
  silently substituted.
- Point `openAudioFile` at a non-audio file → toast appears, transport does not
  pretend to play.
- Make `saveLibrary` return `false` → the footer dot goes `warn` and a toast
  fires.
- Cold start with a large library → the loading state is visible, and no sample
  song ever renders.
- States checklist: empty ✅ (already 5 variants), loading ✅, error ✅,
  success ✅, focus ✅ (kit), disabled ✅ (kit).

**Anti-pattern guards**
- No spinner on a 20 ms local read — a text line is the right weight.
- Do not stack toasts; one message, replaced.
- If the Toast component proves itself, propose it upstream as `@singz/ui`
  v1.5.0 (SingZ has toasts too) — but do not block this phase on that.

---

## Phase 6 — Honour the platform's two preferences

**Files:** `src/App.tsx`, `src/styles/app.css`.

**What to implement**

1. `prefers-color-scheme`: the palette comes only from stored prefs today
   (`App.tsx:100-104`), so a machine in light mode still opens dark. When there
   is **no** stored preference, read the media query and pick `atelier` for
   light. An explicit user choice always wins and is still persisted.
2. `prefers-reduced-motion`: consume Phase 1's kit-side sweep and add nothing
   locally, except gating the one animation ChordZ owns that the kit's sweep
   cannot reach — the performance-mode auto-scroll rAF
   (`PerformanceOverlay.tsx:36-49`), which is JS, not CSS. When the query
   matches, default `running` to `false` and let the user start it.

**Verification**
- Fresh profile (no `chordz:prefs:v2`) on a light-mode machine opens atelier;
  on a dark-mode machine opens night. Toggling and reloading keeps the choice.
- OS "Reduce motion" on: the helper panel does not slide, the modal does not
  rise, and performance mode opens paused.
- `grep -rn "prefers-reduced-motion" src/styles` returns nothing (it lives in
  the kit).

**Anti-pattern guards**
- Do not read the media query on every render; one `matchMedia` at first load
  plus a listener.
- Do not overwrite a stored preference when the OS setting changes.

---

## Phase 7 — Verification: re-run the audit

**What to implement:** nothing. Prove the redesign moved the numbers.

1. Re-run the original evidence probes (available in Git history) and record
   the new values beside the old ones.
2. Re-score against the original scorecard anchors (available in Git history).

**Cutover criteria — all must hold**

| Metric | Before | Required |
|---|---|---|
| Total score | 16/30 | ≥ 20, and no principle below 2 |
| Song page share at 1320×860 | 41.3% | ≥ 60% |
| Toolbar height | 137px | ≤ 56px |
| Interactive elements at rest | 100 | < 60 |
| Duplicated affordances | 3 | 0 |
| UI type sizes (app CSS) | 12 | ≤ 7 |
| Spacing values | 20 | ≤ 9 |
| States present | 3 of 6 | 6 of 6 |
| Lowest text contrast | 2.91:1 | ≥ 4.5:1 |
| Keyboard-reachable song rows | 0 of 4 | all |
| Production budget | 292 KB / 4 requests | no regression |

3. Grep guards, all must return clean:
   - `grep -rn "onShowHelperChange(!" src/components` → 1 hit
   - `grep -rn "body::before\|body::after" src/styles` → 0 hits
   - `grep -rn "prefers-reduced-motion" src/styles` → 0 hits
   - `grep -oE "font-size: [0-9.]+px" src/styles/*.css | sort -u` → ⊆ the six
4. `npx tsc -b && npx vite build` clean; bundle within budget.
5. Walk the primary task end to end with the keyboard only: open the app, find a
   song, read it, transpose it, perform it, leave.

**Anti-pattern guards**
- Do not re-score generously to clear the bar. If a principle is still at 1,
  the phase that owned it is not done.
- Do not skip the before/after screenshot pair; a redesign that cannot be seen
  side by side has not been reviewed.
