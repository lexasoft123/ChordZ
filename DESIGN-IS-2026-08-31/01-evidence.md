# Evidence — after

All figures measured live on 2026-08-31 against the default state in
`00-scope.md`. "Before" is `DESIGN-IS-2026-08-30/01-evidence.md`. Facts only;
scoring is in `02-scorecard.md`.

## A. Structural

| Fact | Before | After |
|---|---|---|
| Interactive elements on the default screen | 100 | **68** |
| — of which are chord tokens in the song text | 45 | 45 |
| — the app's own chrome controls | 55 | **23** |
| Total DOM nodes under `.app` | 1285 | **359** |
| Max nesting depth | 11 | 11 |
| Toolbar | 15 controls, **137px**, two rows | 5 controls, **56px**, one row |
| Focusable song rows | **0 of 4** | **4 of 4** |
| Song page (`.preview`) share at 1320×860 | **41.3%** | **64.4%** |
| Chrome share | 58.7% | **35.6%** |

The interactive count is a poor proxy on its own: 45 of the 68 are the chord
tokens *inside the lyrics*, one per chord, and they scale with song length
rather than with the design. The chrome number is the one that measures the
shell, and it went 55 → 23.

**Repeated affordances (same purpose, two places, same screen): 3 → 0**

| Was duplicated | Now |
|---|---|
| Guitar-helper toggle — `Toolbar.tsx:155` **and** `Player.tsx:70` | Transport only. `grep -rn "onShowHelperChange(!" src/components` → 1 hit |
| Key / tempo / capo — toolbar controls **and** the always-open details panel | Panel edits them; the toolbar prints one read-only line. `grep -n "onTempoChange\|onCapoChange" src/components/Toolbar.tsx` → 0 hits |
| Chords used — details panel **and** the helper's chord drawer | Details panel only; the drawer is gone with the helper's rail |

## B. Visual

| Fact | Before | After |
|---|---|---|
| Type sizes rendered (UI, SVG internals excluded) | **12** — 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14, 17, 30 | **7** — 9.5, 10, 11, 12, 14, 17, 22 |
| — of which the app's own | 12 | **5 on this screen** (10, 12, 14, 17, 22; `--t-title` 30px is the empty state) |
| — of which are the kit's | 0 | **2** — `.badge` 9.5px, `.chip` 11px |
| Spacing values rendered | **20**, no grid | **15**, of which the app's own are **8** on an 8px base |
| — the kit's, unreachable from the app | — | 1, 5, 6, 7, 14, 92px (`.pill`, `.chip`, `.round-ghost`, `.titlebar`) |
| Corner radii | 5 — 5px, 7px, 50%, 99px, 999px | app: 7px, 99px, 50%; 999px is the kit's `.pill` |
| Literal colours outside the token file | `Fretboard.tsx` gradients only (documented) | same, and `BOX_COLORS` now reads the kit's stem table instead of a hand-copy of it |

The app's own CSS declares zero literal type sizes, spacing values or colours:

```
grep -ohE "font-size: *[0-9.]+px" src/styles/*.css   → 0 hits
grep -rlnE "#[0-9a-fA-F]{6}" src/styles/*.css         → 0 hits
```

Everything still off-grid on screen belongs to `@singz/ui`, whose component
sizes the app may not override — the conventions forbid it. Closing that gap
means putting the kit's own components on a shared scale, upstream.

**Contrast — night palette (measured, alpha-composited, gradient-aware)**

| | Before | After |
|---|---|---|
| Text nodes measured | 100 | 138 |
| Failing AA | **5** | **0** |
| Lowest ratio | **2.91:1** | **5.07:1** |

The five failures were all `--sz-faint` on a dark ground. `--faint` is no
longer a text colour in this app: fifteen text rules moved to `--dim`, and the
token is documented as non-text-only.

**Contrast — atelier palette.** The 2026-08-30 audit never measured it. It had
**10** failures; it now has **4**, all one root cause: `--sz-accent` (#b5491c)
is marginal as *text*, at 4.45:1 on `--panel` and 3.63:1 once it sits on its
own `--accent-soft` tint. Two are the app's (`.chord-diagram-name`, the active
library row) and two are the kit's (`.mode-seg button.on`, `.pill.on`).
Darkening the accent to about #963c16 clears 4.5:1 everywhere, measured — but
re-toning a shared brand colour is a decision, not a bug fix, so it is
reported rather than taken.

**States checklist**

| State | Before | After |
|---|---|---|
| Empty | yes, 5 variants | yes |
| Focus | yes (kit ring) | yes — and the ring is now visible in **both** palettes; it was 1.46:1 on paper before kit v1.4.3 |
| Disabled | yes (kit, .45) | yes |
| Loading | **no** | **yes** — `hydrating` holds the workspace; no sample song renders over a real library |
| Error | **no** | **yes** — corrupt library, failed write, undecodable audio, all via the kit's `.toast` |
| Success | **no** | **yes** — `StatusDot` + a word in the sidebar footer |

## C. Copy & honesty

- **Marketing inflation:** none, unchanged.
- **Dark patterns:** none, unchanged.
- **Label → behavior mismatch: 1 → 0.** The transport printed
  `{song.meta.tempo} BPM` live while the click track had captured its tempo
  once at play time. The click track is now owned by an effect keyed on the
  tempo. Measured: with the readout at 200 BPM the click fires 3.33×/sec —
  exactly 200 BPM — after being started at 76.
- **Silent failure: 3 → 0.** All three now surface (see States above).
- Unlabelled focusable elements: **0 of 68**. The search field gained a real
  `aria-label`; it had only a placeholder, which is not a label.

## D. Weight & friction

| Fact | Before | After |
|---|---|---|
| Requests for the primary view | 4 | **4** |
| JS | 195 KB | **195 KB** |
| CSS | 34 KB | **35 KB** |
| Fonts | 63 KB, 2 requests | **63 KB, 2 requests** |
| Total transferred | ~292 KB | **~293 KB** |
| Idle animations on the default screen | 1 | 1 |
| Modals / badges / notifications on load | 0 | 0 |

**Motion and OS preferences**

- `prefers-reduced-motion`: **absent** → **gated in the kit** (v1.4.1), one
  sweep covering the kit's four keyframes and the host's transitions.
  Deliberately absent from `src/styles`: `grep -rn "prefers-reduced-motion"
  src/styles` → 0 hits, because a second `!important` sweep would make the
  rule un-overridable. Verified by re-scoping the media condition live:
  transitions collapse 0.15s → 0.01ms and restore.
- The one animation CSS cannot reach — performance mode's `requestAnimationFrame`
  auto-scroll — is gated in JS. Verified: under reduced motion the overlay
  opens showing "Resume scroll" and `scrollTop` stays 0; without it, "Pause
  scroll".
- `prefers-color-scheme`: **never read** → read on first run only. Verified: a
  fresh profile on a light-mode machine opens atelier; choosing night and
  reloading stays night while the OS still says light.

## E. Accessibility

| Fact | Before | After |
|---|---|---|
| Focusable controls | 100, 0 unlabelled | 68, **0 unlabelled** |
| ARIA landmarks | 13 | 8 (the shell has fewer regions) |
| Focus order (first 10) | Toggle palette → New song → Search → Preview → Split → Edit → Perform → details → Transpose down → Transpose up | Toggle palette → New song → Search → *each song row, each followed by its delete* |
| **Song selection by keyboard** | **not possible** | **yes** — rows are `<button type="button">`, 4 of 4 tab stops in list order |
| **Song deletion by keyboard** | **not possible** | **yes** — Delete/Backspace on the focused row, plus a visible × revealed by `:hover` **and** `:focus-within` |
| Delete confirm | right-click only | three routes, one dialog. Verified: Delete opens the confirm naming the right song; Escape closes it with nothing removed |
| Escape / Space in performance mode | handled | handled |
| Skip link | none | none |
