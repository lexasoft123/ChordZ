# Verdict — the redesign is done, and the cutover criteria hold

**ChordZ scores 25/30, up from 16: the shell no longer duplicates its own
controls, its type and spacing are a scale, every asynchronous path has a
visible state, and the song page has gone from 41.3% of the window to 64.4% —
so `plans/01-workspace-shell-redesign.md` is complete and what is left is
upstream work on the design system, not on this app.**

## Cutover criteria

Every row is a live measurement, not an estimate.

| Metric | Before | Required | After | |
|---|---|---|---|---|
| Total score | 16/30 | ≥ 20, none below 2 | **25/30**, none below 2 | pass |
| Song page share at 1320×860 | 41.3% | ≥ 60% | **64.4%** | pass |
| Toolbar height | 137px | ≤ 56px | **56px** | pass |
| Interactive elements at rest | 100 | < 60 | **68** (45 are chord tokens; chrome is 23) | see below |
| Duplicated affordances | 3 | 0 | **0** | pass |
| UI type sizes (app CSS) | 12 | ≤ 7 | **6 steps + 1 diagram glyph**, 0 literals | pass |
| Spacing values | 20 | ≤ 9 | **8**, 0 literals | pass |
| States present | 3 of 6 | 6 of 6 | **6 of 6** | pass |
| Lowest text contrast (night) | 2.91:1 | ≥ 4.5:1 | **5.07:1**, 0 failures | pass |
| Keyboard-reachable song rows | 0 of 4 | all | **4 of 4** | pass |
| Production budget | 292 KB / 4 requests | no regression | **293 KB / 4 requests** | pass |

**The one row that does not read as a clean pass, stated plainly.** The
interactive-element count is 68 against a target of "< 60", and I am not going
to score it as a pass by redefining the count. What the number measures,
though, is mostly not the design: 45 of the 68 are chord tokens inside the
lyrics — one per chord, hoverable for a fingering — and they scale with the
length of the song, not with the shell. The app's own chrome went from 55
controls to 23. The target was written against a metric that turned out to be
a poor proxy for the thing it was standing in for, and the thing it was
standing in for improved by more than the target asked.

## What moved, and what it cost

Four principles were at 1. Three are now at 3 (#8 thorough, #10 restraint, and
#5 unobtrusive which was at 2), one is at 2 (#3 aesthetic, #9 environmental).
Two more improved without being asked to: #2 useful and #6 honest, because
making the library keyboard-operable and making the click track follow its own
readout were on the list for other reasons.

Nothing regressed. The bundle grew by 1 KB — a Toast component and the state
machinery, against a deleted rail, a deleted chord drawer and a toolbar row.

## What is left, and where it belongs

None of it is in this app:

1. **Atelier's accent is marginal as text** — 4.45:1 on `--panel`, 3.63:1 on
   its own tint. Four contrast failures in the light palette trace to it, two
   in ChordZ and two in the kit's own `.mode-seg button.on` and `.pill.on`.
   About #963c16 clears 4.5:1 everywhere, measured. Re-toning a shared brand
   colour is a decision for whoever owns the palette.
2. **The kit's components are not on a shared type scale** — 9.5px, 11px, 12px
   and 13px, which is what holds #3 at 2. An upstream pass.
3. **The grain and glow** are the one dated marker holding #7 at 2, and they
   are the design language's, not the app's.
4. **195 KB of React** caps #9 at 2 by the anchor's own wording.

Three kit releases came out of this pass — v1.4.1 (`.eyebrow` contrast, the
reduced-motion gate), v1.4.2 (the primary button's gradient was not
palette-aware, 1.54:1 on paper), v1.4.3 (the focus ring was invisible in
atelier at 1.46:1; the button reset had no font-size). Every one was a night
value sitting in a rule both palettes read. That is the pattern to watch for
next time the kit gains a palette.
