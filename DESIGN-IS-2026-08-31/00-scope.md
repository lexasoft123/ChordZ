# Scope — re-audit after the workspace-shell redesign

This is Phase 7 of `plans/01-workspace-shell-redesign.md`: the same audit, run
again against the same surface, to see whether the redesign moved the numbers.

**Audited:** the ChordZ desktop workspace at its default state — Electron's
1320×860, night palette, no stored prefs (`chordz:prefs:v2` cleared before
every probe), the first sample song open, details panel and guitar helper both
shut. Identical to `DESIGN-IS-2026-08-30/00-scope.md` so the two are
comparable.

**Not re-litigated:** the primary user (a working musician keeping a personal
songbook) and the primary task (open a song and read it while your hands are
busy) are unchanged, as is the design language — `@singz/ui` night-studio,
consumed from `../singz-ui`.

**What changed between the two audits:** commits `06843ab` (type and spacing
scales), `c459c31` (shell recomposition), `41fbc26` (keyboard library),
`01806b7` (loading/error/saved states), `9c42eac` (OS preferences), plus kit
releases v1.4.1, v1.4.2 and v1.4.3.

**Method note.** Every figure below was measured in a live browser against the
running app, not inferred from source. Two probe corrections were needed and
are recorded because they changed conclusions:

- `getComputedStyle` returns **stale values** after a `data-sz-palette` change
  while the Browser pane is hidden. Measuring the atelier palette without
  forcing a repaint first reported 70 contrast failures; the real number is 4.
  Every palette measurement here forces layout before reading.
- The contrast probe had to learn about **`background-image`**. A control
  filled with a gradient was being measured against the page behind it, which
  reported the Perform button at 1.09:1 when it is 7.42:1 at its worst stop.
  The probe now reads the gradient's stops and scores the worst.

**Tool artifacts, not app defects.** The browser's synthetic `Return` does not
carry a button's default activation, so Enter-to-activate cannot be observed
through it — on the palette toggle either. It is verified structurally
instead: the rows are real `<button type="button">` elements and neither the
row handler nor the app's global shortcut handler calls `preventDefault` for
Enter or Space, so activation is left to the platform, which guarantees it.
