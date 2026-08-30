# Evidence

All figures measured on 2026-08-30 against the default state described in
`00-scope.md`. Facts only; scoring is in `02-scorecard.md`.

## A. Structural

| Fact | Value | Source |
|---|---|---|
| Interactive elements on the default screen | **100** | live probe, `.app button,input,textarea,select,a[href],[tabindex]` |
| Total DOM nodes under `.app` | 1285 | live probe |
| Max nesting depth | 11 | live probe |
| Toolbar controls | 15 buttons/inputs, in a **137px** two-row header | live probe; `src/components/Toolbar.tsx:40-171` |
| Focusable song rows | **0 of 4** | `li.sidebar-item` has `onClick` but no `tabIndex`/`role` — `src/components/Sidebar.tsx:55-72` |
| Unused imports / dead props | 0 (`tsc -b` clean; class audit clean) | `npx tsc -b` |

**Repeated affordances (same purpose, two places, same screen)**
1. Guitar-helper toggle — `src/components/Toolbar.tsx:155` **and**
   `src/components/Player.tsx:70`.
2. Key / tempo / capo readouts — `src/components/Toolbar.tsx:35-37` (toolbar
   control strip) **and** `src/components/MetadataPanel.tsx:32-46` (details
   panel), both visible simultaneously by default.
3. Chords used — `src/components/MetadataPanel.tsx:84-91` **and** the helper's
   chord palette `src/components/GuitarHelper.tsx:144-156`.

**Layout share at 1320×860 (Electron's default size)**
- Song page (`.preview`): **41.3%** of the window, 690px lyric column
- Chrome (titlebar + sidebar + toolbar + details + transport): **58.7%**

## B. Visual

| Fact | Value | Source |
|---|---|---|
| Type sizes rendered (UI, excluding SVG-internal 7/8/13.33px) | **12**: 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14, 17, 30 | live probe over every node |
| Spacing values rendered | **20**: 1,2,3,4,5,6,7,8,9,10,12,14,16,18,20,22,26,30,34,92 — no 4/8px grid | live probe (padding/margin/gap) |
| Corner radii | 5: `5px`, `7px`, `50%`, `99px`, `999px` | live probe |
| Distinct rendered colours | **12** — all resolve from `--sz-*` tokens | live probe |
| Literal colours outside the token file | 0 in the kit (`npm run themeable`); in ChordZ only `Fretboard.tsx` gradients, documented as an exception | `src/styles/tokens.css:9-11` |

**Contrast (measured, alpha-composited against the real stacked background)**

| Element | Size | Ratio | AA |
|---|---|---|---|
| Lyric line | 17px | 16.58 | pass |
| Chord above lyric | 11.5px | 9.33 | pass |
| Song title | 30px | 16.58 | pass |
| Artist | 12.5px | 6.10 | pass |
| Active library row | 13px | 7.75 | pass |
| Segmented control (off / on) | 12px | 6.10 / 7.50 | pass |
| Chip (resting / pressed) | 11px | 6.10 / 7.50 | pass |
| Key badge | 9.5px | 5.07 | pass |
| **`.eyebrow` group labels** | 10px | **3.27** | **fail** |
| **Library BPM** | 9.5px | **2.91** | **fail** |
| **Song-count footer** | 10.5px | **3.27** | **fail** |
| **Titlebar tagline** | 11.5px | **3.20** | **fail** |
| **Preview section label** | 11.5px | **3.20** | **fail** |

All five failures are the same pairing: `--sz-faint` (#6b6355) on `--sz-bg`
(#12100d). `.eyebrow` is the kit's own type style
(`node_modules/@singz/ui/dist/kit.css`, `.eyebrow { color: var(--sz-faint) }`),
so the failure is inherited and then repeated across every group label in
ChordZ.

**States checklist**

| State | Present | Evidence |
|---|---|---|
| Empty | **yes**, 5 variants | `Workspace.tsx:158-165`, `Sidebar.tsx:51`, `Preview.tsx:27`, `MetadataPanel.tsx:87`, `GuitarHelper.tsx:151` |
| Focus | **yes** (kit ring) | `kit.css` `button:focus-visible { outline: 2px solid … }` |
| Disabled | **yes** (kit, .45) | `kit.css` `.pill:disabled,.chip:disabled,…`; used at `Toolbar.tsx:129,150` |
| Loading | **no** | library hydration renders samples then swaps with no indication — `App.tsx:63-83` |
| Error | **no** | corrupt library swallowed `App.tsx:76-78`; `saveLibrary` boolean discarded `App.tsx:92`; `<audio>` has **no `onError`** `Player.tsx:164-172` |
| Success | **no** | nothing confirms a save or a completed load |

The kit ships a `.toast` styled for exactly this ("Could not decode that audio
file." is its demo copy) and ChordZ renders it nowhere.

## C. Copy & honesty

Every user-facing string was read (`Toolbar.tsx`, `Sidebar.tsx`, `Player.tsx`,
`GuitarHelper.tsx`, `PerformanceOverlay.tsx`, `MetadataPanel.tsx`,
`Workspace.tsx`, `Titlebar.tsx`).

- **Marketing inflation:** none. There is no superlative anywhere in the UI.
- **Dark patterns:** none. No forced continuity, hidden cost, fake scarcity or
  confirmshaming. The delete dialog offers "Delete" / "Keep" — neutral verbs,
  destructive action not pre-selected (`Sidebar.tsx:89-110`).
- **Jargon:** "Backing", "Capo", "Box", "Tones", "Deg" — all standard to the
  audience (guitarists); not flagged.
- **Label → behavior mismatch (1):** the transport prints
  `{song.meta.tempo} BPM · 4/4` live (`Player.tsx:145`) while the click track
  captured its tempo once at play time (`Player.tsx:58`
  `startBackingClick(song.meta.tempo ?? 90)`). Editing BPM during playback
  changes the number on screen and not the sound.
- **Silent failure:** `bridge.saveLibrary` returns a boolean that is discarded
  (`App.tsx:92`), so a failed write to disk is indistinguishable from a
  successful one. Counted under States/error above, not double-counted here.
- 0 of 100 focusable elements lack an accessible name.

## D. Weight & friction

Measured against the production build (`npm run build`) served statically:

| Fact | Value |
|---|---|
| Requests for the primary view | **4** |
| JS | **195 KB** (63 KB gzip) |
| CSS | **34 KB** (11 KB gzip) |
| Fonts | **63 KB**, 2 requests (latin subsets of the 2 bundled families) |
| Total transferred | ~292 KB |
| First paint | 40 ms |
| `loadEventEnd` | 20 ms |
| Idle animations on the default screen | 1 |
| Modals / badges / notifications on load | 0 |

**Motion and OS preferences**
- `prefers-reduced-motion`: **absent** from both `src/styles/*.css` and
  `node_modules/@singz/ui/dist/kit.css` (grep, 0 hits).
- 7 keyframe animations and 14 transitions ship
  (`app.css:549,923,1009` + `kit.css:150,493,503,549`).
- `prefers-color-scheme`: **never read**. The palette comes only from stored
  prefs (`App.tsx:100-104`); a machine set to light mode still opens dark.

## E. Accessibility

| Fact | Value |
|---|---|
| Focusable controls | 100, **0 unlabelled** |
| ARIA landmarks | 13 (`aside`, `nav`, `main`, `header`×2, `footer`, `section[Guitar scale helper]`, `nav[Helper tools]`, `aside[Chords in song]`, 3 labelled groups) |
| Focus order (first 10) | Toggle palette → New song → Search → Preview → Split → Edit → Perform → Toggle details panel → Transpose down → Transpose up |
| Skip link | none |
| **Song selection by keyboard** | **not possible** — rows are `<li onClick>` with no tab stop (`Sidebar.tsx:55-72`) |
| **Song deletion by keyboard** | **not possible** — bound to `onContextMenu` only (`Sidebar.tsx:64-67`), with no visible affordance |
| Escape / Space in performance mode | handled (`PerformanceOverlay.tsx:26-32`) |
| Modal Escape + scrim dismiss | handled by the kit's `Modal` |
