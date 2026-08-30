# Verdict — REDESIGN

**ChordZ scores 16/30: the design is honest, legible and correctly themed, but
its workspace shell duplicates its own controls, its type and spacing scales
are not scales, and it has no answer for loading, error or failure — so the
next pass has to rebuild the screen system rather than restyle it.**

## Why REDESIGN and not REFINE

Total is below the 20-point threshold, and stays below it (18) even under the
most generous defensible reading of the two borderline scores. No principle
scored 0 — nothing here is broken — but four of ten sit at 1, and three of
those four (#3 aesthetic, #8 thorough, #10 restraint) are properties of the
**screen system**, not of individual components. You cannot fix "three
affordances are duplicated" or "the toolbar is 137px of 15 controls" by
adjusting values; the arrangement has to change.

Scope this precisely: the design **language** is not in question. It is
`@singz/ui` night-studio, shared deliberately with SingZ, and it earned 2s on
honesty, longevity and comprehension. What failed the audit is what ChordZ
built *on top of it*.

## The 3–5 highest-leverage moves

1. **#10 — Collapse the duplicated affordances.** One helper toggle, not two
   (`Toolbar.tsx:155` + `Player.tsx:70`); key/tempo/capo live in one place, not
   in the toolbar *and* the always-open details panel (`Toolbar.tsx:35-37` +
   `MetadataPanel.tsx:32-46`); the chord palette exists once
   (`MetadataPanel.tsx:84-91` + `GuitarHelper.tsx:144-156`). This is also the
   cheapest route to #5: the toolbar's 137px and the details panel's 288px are
   what push the song page down to 41.3% of the window.

2. **#8 — Ship the three missing states.** Loading while the library hydrates
   (`App.tsx:63-83`), an error path for a corrupt library (`App.tsx:76-78`), a
   failed save (`App.tsx:92`) and an undecodable audio file
   (`Player.tsx:164-172` has no `onError`). The kit already ships the `.toast`
   these need; ChordZ renders it nowhere.

3. **#3 — Adopt a real type and spacing scale.** 12 UI type sizes with
   half-pixel steps and 20 spacing values with no grid. Pick ~6 sizes and an
   8px-based spacing set, then delete every value that is not on it. Because
   every size is already a token reference, this is a one-file change with a
   whole-app effect.

4. **#2 / accessibility — Make the library keyboard-operable.** Song rows are
   `<li onClick>` with no tab stop (`Sidebar.tsx:55-72`) and Delete is
   right-click-only (`Sidebar.tsx:64-67`). Rows become buttons or an
   `aria-activedescendant` listbox; Delete gets a visible affordance.

5. **#9 / #3 — Honour the platform's two preferences.** Add a
   `prefers-reduced-motion` block (7 keyframes, 14 transitions, currently
   ungated) and read `prefers-color-scheme` for the initial palette
   (`App.tsx:100-104`). Fix `--sz-faint` on `--sz-bg` while you are in the
   token file: 3.27:1 at 10px fails AA on every `.eyebrow` label in the app —
   and since `.eyebrow` is the kit's own style, that fix belongs upstream.

## What this verdict is not saying

It is not saying start from purpose. The information architecture — library,
song page, transport, opt-in helper — matched the primary task in every probe.
It is saying the shell built around that IA carries more furniture than the
task needs, and that the polish layer (states, scale discipline, preference
handling) was never finished.
