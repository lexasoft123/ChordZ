# Scorecard — ChordZ desktop UI

Anchors applied verbatim from the skill. Tie-breaker: when between two levels,
take the lower. Worst instance scored, not the mean.

**1. Good design is innovative — 2/3**
Evidence: the scale/box helper docks under the song and seeds itself from the
song's key (`Workspace.tsx:130-141`); chord tokens open a fingering diagram on
hover (`ChordToken.tsx`). The shell is a conventional three-pane editor.
Justification: a clear improvement on the peer pattern (a chart you read and a
fretboard you consult are usually two apps), not a form nobody has shipped.

**2. Good design makes a product useful — 2/3**
Evidence: select → read is one click; Perform is one click. But song rows are
`<li onClick>` with no tab stop (`Sidebar.tsx:55-72`, 0 of 4 focusable) and
Delete exists only on right-click (`Sidebar.tsx:64-67`).
Justification: the primary task completes cleanly; the adjacent surface — the
library — adds steps and hides one action entirely. That is the level-2 signal,
not level 3's "no decoy actions, fewest possible steps".

**3. Good design is aesthetic — 1/3**
Evidence: 12 UI type sizes with half-pixel steps (9, 9.5, 10, 10.5, 11, 11.5,
12, 12.5, 13, 14, 17, 30), 20 distinct spacing values with no 4/8px grid, 5
corner radii — against a genuinely disciplined 12-colour palette, all tokenised.
Justification: colour obeys a system and the two other axes do not; that is 3+
inconsistencies, which is level 1, not level 2's "≤2 minor".

**4. Good design makes a product understandable — 2/3**
Evidence: 0 of 100 focusable controls lack an accessible name; 13 landmarks;
mode names are plain words. The details-panel toggle is icon-only and leans on
its tooltip (`Toolbar.tsx:56-71`).
Justification: exactly one control needs a tooltip to be named — the level-2
anchor.

**5. Good design is unobtrusive — 2/3**
Evidence: at Electron's default 1320×860 the song page is 41.3% of the window
and chrome is 58.7%; the toolbar alone is 137px tall with 15 controls.
Justification: chrome is quiet — flat, tokenised, no decoration competing with
the lyrics — but it is more than half the window. Level 2, not level 3's
"content is the figure, UI the ground".

**6. Good design is honest — 2/3**
Evidence: no superlatives, no dark patterns, neutral delete verbs. One
label→behavior mismatch: the transport prints tempo live (`Player.tsx:145`)
while the click captured it at play time (`Player.tsx:58`).
Justification: one real mismatch and nothing deceptive — level 2's "≤1 minor".

**7. Good design is long-lasting — 2/3**
Evidence: no skeuomorphism, no fad gradient, no trend typeface; the whole
surface re-themes from `--sz-*` tokens (`src/styles/tokens.css`).
Justification: one dated marker — the film-grain overlay plus dual radial glow
(`kit.css` chrome layer) is a 2020s dark-app signature that will read as of its
moment. Level 2.

**8. Good design is thorough down to the last detail — 1/3**
Evidence: empty (5 variants), focus and disabled are all present and considered.
Loading, error and success are all absent: corrupt library swallowed
(`App.tsx:76-78`), `saveLibrary` result discarded (`App.tsx:92`), `<audio>` with
no `onError` (`Player.tsx:164-172`) — while the kit ships an unused `.toast`
for precisely this.
Justification: three states missing puts it at level 1 ("2–3 states missing").

**9. Good design is environmentally friendly — 1/3**
Evidence: 4 requests, 195 KB JS / 34 KB CSS / 63 KB fonts, first paint 40 ms —
excellent. But `prefers-reduced-motion` appears nowhere (7 keyframe animations,
14 transitions always on) and `prefers-color-scheme` is never read
(`App.tsx:100-104`).
Justification: weight argues level 2, ungated motion argues level 1, and
neither anchor matches cleanly. Tie-breaker takes the lower. The bundle is the
strongest thing on this scorecard and the score does not show it.

**10. Good design is as little design as possible — 1/3**
Evidence: three affordances duplicated on one screen — helper toggle
(`Toolbar.tsx:155` + `Player.tsx:70`), key/tempo/capo (`Toolbar.tsx:35-37` +
`MetadataPanel.tsx:32-46`), chords used (`MetadataPanel.tsx:84-91` + the
helper's palette). 100 interactive elements at rest.
Justification: 3 removable elements is level 1 ("3–5"). Removing any one of the
three breaks nothing.

---

**Total: 16/30**

Distribution: no principle scored 0; six scored 2; four scored 1. The two
load-bearing dimensions — useful (#2) and understandable (#4) — both passed at
2, as did honest (#6). The deficit is concentrated in aesthetic system (#3),
state coverage (#8), motion/preference discipline (#9) and duplication (#10).

Robustness check: even taking the most generous defensible reading of the two
judgment calls (#9 at 2, #3 at 2), the total reaches 18 — still under the
threshold. The verdict does not hinge on a borderline score.
