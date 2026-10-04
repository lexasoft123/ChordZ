# Scorecard — ChordZ desktop UI, after the redesign

Same ten anchors, applied verbatim. Same tie-breaker: when between two levels,
take the lower. Same rule: score the worst instance, not the mean.

**1. Good design is innovative — 2/3** *(was 2)*
Evidence: the scale/box helper docks under the song and seeds itself from the
song's key; chord tokens open a fingering diagram on hover. The shell is still
a conventional editor — a smaller one.
Justification: level 2's "refreshes an existing pattern with a clear
improvement". Removing furniture is good design, not a new form; nothing here
earns level 3, and pretending otherwise would be scoring the effort.

**2. Good design makes a product useful — 3/3** *(was 2)*
Evidence: select → read is one click and one keystroke; 4 of 4 song rows are
tab stops in list order; deletion has three routes including a visible one;
0 of 68 focusable controls are unlabelled.
Justification: the level-2 signal was "the adjacent surface adds steps and
hides one action entirely". The library adds no steps and hides nothing now,
which is level 3's "no decoy actions, fewest possible steps".

**3. Good design is aesthetic — 2/3** *(was 1)*
Evidence: six type steps and eight spacing values on an 8px base, declared in
`tokens.css` with the job each does; three radii; zero literal sizes or
colours in the app's own CSS. But the rendered page still carries the kit's
9.5px and 11px type and its 1/5/6/7/14px spacing.
Justification: the app's own system is complete and enforced by grep, so this
is no longer level 1's "3–5 inconsistencies". It is not level 3's "no orphan
styles" either — a reader sees two scales on one screen. Level 2's "≤2 minor
inconsistencies", and the tie-breaker keeps it there. Level 3 needs the kit's
components on a shared scale, which is an upstream pass.

**4. Good design makes a product understandable — 2/3** *(was 2)*
Evidence: every control is named; the transpose group carries an inline label
it did not have. The details-panel toggle is still icon-only and leans on its
tooltip (`Toolbar.tsx:81-93`).
Justification: exactly one control still needs a tooltip to be named — the
level-2 anchor, unchanged.

**5. Good design is unobtrusive — 3/3** *(was 2)*
Evidence: the song page is 64.4% of the window, up from 41.3%; chrome is
35.6%, down from 58.7%; the toolbar is 56px, down from 137px.
Justification: level 2 was "chrome visible but quiet, and more than half the
window". Chrome is now roughly a third and the song is plainly the figure —
level 3.

**6. Good design is honest — 3/3** *(was 2)*
Evidence: no superlatives, no dark patterns, neutral delete verbs — unchanged.
The one label→behavior mismatch is fixed: the click track follows the tempo
the bar prints, measured at 3.33 clicks/sec against a 200 BPM readout. Three
silent failures now speak.
Justification: level 3's "every claim, badge and label maps 1:1 to actual
behavior". The app no longer shows a number that the sound disagrees with, or
reports success it did not have.

**7. Good design is long-lasting — 2/3** *(was 2)*
Evidence: no skeuomorphism, no fad gradient, no trend typeface; the whole
surface re-themes from `--sz-*`. The film-grain overlay and dual radial glow
are still there.
Justification: one dated marker, unchanged — a 2020s dark-app signature that
will read as of its moment. It is the kit's, and deliberate. Level 2.

**8. Good design is thorough down to the last detail — 3/3** *(was 1)*
Evidence: all six states present and considered — empty (5 variants), focus
(kit ring, now visible in both palettes), disabled, loading, error, success.
The corrupt-library path goes further than reporting: writing stays off for
the session so the unreadable file is not overwritten, verified byte-for-byte.
Justification: level 3's "all present and considered". The extra care on the
error path is what "considered" means.

**9. Good design is environmentally friendly — 2/3** *(was 1)*
Evidence: 4 requests, 195 KB JS / 35 KB CSS / 63 KB fonts, unchanged.
`prefers-reduced-motion` is gated, in the kit, once; `prefers-color-scheme` is
read on first run.
Justification: level 3 asks for "initial JS <100KB" and this is 195 KB, so it
caps at level 2's "<500KB, motion gated" — which it now clearly meets. The
tie-breaker no longer has to drag it down to 1, because the motion half of the
anchor is satisfied outright.

**10. Good design is as little design as possible — 3/3** *(was 1)*
Evidence: zero duplicated affordances, down from three, each verified by grep.
The app's chrome is 23 controls, down from 55; DOM under `.app` is 359 nodes,
down from 1285.
Justification: level 1 was "3–5 removable elements". Nothing on the default
screen now appears twice, and the elements added by this pass — the row
delete ×, the save status — exist because the audit found their absence to be
a fault. Level 3's "every element earns its place".

---

**Total: 25/30** *(was 16/30)*

Distribution: five 3s, five 2s, no 1s, no 0s. Every principle that scored 1 —
#3 aesthetic, #8 thorough, #9 environmental, #10 restraint — has moved, three
of them to 3. The two load-bearing dimensions that already passed, #2 useful
and #4 understandable, did not regress; #2 improved.

The five remaining 2s are honest ceilings rather than loose ends:

- **#1** would need a new form, not a tidier one.
- **#3** needs `@singz/ui` to put its own components on a shared type scale.
- **#4** needs the details toggle to carry a word, at the cost of bar width.
- **#7** would mean dropping the kit's grain and glow, which is a decision for
  the design language, not for this app.
- **#9** is capped by a 195 KB React bundle; the anchor wants under 100 KB.

Three of those five are upstream or cross-app decisions. That is the honest
shape of an app that consumes a design system rather than owning one.
