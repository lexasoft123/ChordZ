# Handoff

Copy the block below into a fresh session.

````
/make-plan Redesign the ChordZ workspace shell (library sidebar, toolbar, details panel, transport). Current design failed a Dieter Rams audit at 16/30 with 1-scores on principles #3 aesthetic, #8 thorough, #9 environmentally friendly, and #10 as little design as possible.

Verdict paragraph (quoted from the audit):
> ChordZ scores 16/30: the design is honest, legible and correctly themed, but its workspace shell duplicates its own controls, its type and spacing scales are not scales, and it has no answer for loading, error or failure — so the next pass has to rebuild the screen system rather than restyle it.

Why redesign and not refine: no principle scored 0 and the total stays below the 20 threshold (18) even under the most generous reading of the borderline scores. Three of the four 1-scores are properties of the screen system — duplicated affordances, an unsystematic type/spacing ramp, absent states — which cannot be fixed by adjusting values in place.

Context the plan needs:
- App: ChordZ, an Electron/React (18.3 + Vite) chord-and-lyric notebook for musicians. Repo branch `claude/singz-design-ui-kit-7c7da9`.
- Primary user: a working musician keeping a personal songbook. Primary task: open a song and read it while your hands are busy.
- The design language is `@singz/ui` night-studio (local dependency `file:../singz-ui`), shared with the SingZ app. Its class names are a public contract. Colour, pills, chips, segmented control, modal, slider, eyebrow, scrollbars, the ambient "room" and both palettes come from the kit — do not re-implement any of them in the app.

Preserve from the current design:
- The whole token layer — `src/styles/tokens.css` aliases `--sz-*` to app names; 12 rendered colours, all tokenised, and both palettes (`data-sz-palette="atelier"`) work. Do not add a local palette.
- The information architecture: library sidebar → song page → transport, with an opt-in guitar helper. Every probe showed it matches the primary task.
- Kit adoption in `src/components/*` (Button/Chip/SegmentedControl/Modal/Badge/slider/eyebrow) — `src/components/Toolbar.tsx`, `Player.tsx`, `Sidebar.tsx`, `FretboardControls.tsx`.
- Performance mode (`src/components/PerformanceOverlay.tsx`) — big type, amber chords, Escape and Space handled, chrome reduced to one bar. It is the app at its best.
- The production budget: 4 requests, 195 KB JS / 34 KB CSS / 63 KB fonts, 40 ms first paint. Do not regress it.

Discard:
- The two-row 137px toolbar carrying 15 controls (`src/components/Toolbar.tsx:40-171`). Caused failures on #5 and #10.
- The always-open details panel that restates the toolbar's key/tempo/capo (`src/components/MetadataPanel.tsx:32-46` vs `src/components/Toolbar.tsx:35-37`). Caused failure on #10.
- The second guitar-helper toggle (`src/components/Player.tsx:70` duplicating `src/components/Toolbar.tsx:155`). Caused failure on #10.
- The ad-hoc type and spacing ramp — 12 UI type sizes with half-pixel steps, 20 spacing values with no grid. Caused failure on #3.
- Right-click-only deletion (`src/components/Sidebar.tsx:64-67`). Caused failure on #2.

Top 5 moves from the audit (verbatim):
1. #10 — Collapse the duplicated affordances: one helper toggle, not two (`Toolbar.tsx:155` + `Player.tsx:70`); key/tempo/capo in one place, not the toolbar *and* the always-open details panel (`Toolbar.tsx:35-37` + `MetadataPanel.tsx:32-46`); one chord palette (`MetadataPanel.tsx:84-91` + `GuitarHelper.tsx:144-156`). Also the cheapest route to #5 — the toolbar's 137px and the panel's 288px are what push the song page down to 41.3% of the window.
2. #8 — Ship the three missing states: loading while the library hydrates (`App.tsx:63-83`), an error path for a corrupt library (`App.tsx:76-78`), a failed save (`App.tsx:92`), and an undecodable audio file (`Player.tsx:164-172` has no `onError`). The kit already ships the `.toast` these need.
3. #3 — Adopt a real type and spacing scale: pick ~6 type sizes and an 8px-based spacing set, then delete every value not on it. Every size is already a token reference, so this is one file with a whole-app effect.
4. #2 — Make the library keyboard-operable: song rows are `<li onClick>` with no tab stop (`Sidebar.tsx:55-72`) and Delete is right-click-only (`Sidebar.tsx:64-67`). Rows become buttons or an `aria-activedescendant` listbox; Delete gets a visible affordance.
5. #9 — Honour the platform's two preferences: add a `prefers-reduced-motion` block (7 keyframes, 14 transitions, currently ungated) and read `prefers-color-scheme` for the initial palette (`App.tsx:100-104`). Fix `--sz-faint` on `--sz-bg` at the same time — 3.27:1 at 10px fails WCAG AA on every `.eyebrow` label — and since `.eyebrow` is the kit's own style, that fix belongs upstream in `../singz-ui`.

Redesign principles in priority order:
1. As little design as possible (#10) — a control appears once. If removing an element does not break the task, it is not in the design.
2. Thorough (#8) — every asynchronous path has a visible loading, error and settled state before the pass is done.
3. Unobtrusive (#5) — the song page is the figure. Target: content above 60% of the window at 1320×860, versus 41.3% today.

Deliverables for the plan:
- New information architecture for the shell — not derived from the current three-panel arrangement — with the song page's share of the window stated as a number.
- New primary flow (low-fi, labelled), shown side by side with the current one.
- Type scale and spacing scale as an explicit, short list of allowed values, plus the grep that proves nothing outside the list ships.
- States checklist: empty, loading, error, success, focus, disabled — each with the component that owns it.
- Which fixes belong upstream in `@singz/ui` versus in ChordZ (at minimum the `.eyebrow` contrast fix is upstream).
- Migration: the app persists prefs under `chordz:prefs:v2` and a library JSON via the Electron bridge — say what happens to both.
- Cutover criteria: the audit is re-run and every 1-score has moved to 2 or better.

Anti-patterns to guard against (specific to REDESIGN):
- Porting the old three-panel structure under new styling.
- Keeping both shells behind a flag indefinitely.
- Redesigning toward a trend instead of the three priority principles above — the night-studio language is fixed and shared with SingZ.
- Treating the Preserve list as optional; the token layer and the kit adoption are not up for renegotiation.
- Regressing the 292 KB / 4-request budget in the name of polish.
````
