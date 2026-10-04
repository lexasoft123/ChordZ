# Scope — ChordZ desktop UI

**Audited:** the ChordZ Electron/React renderer on branch
`claude/singz-design-ui-kit-7c7da9`, running at `http://localhost:5173` and as
the production build served from `dist/`. Default state: night palette,
Preview mode, guitar helper closed, at the Electron default window size
(1320×860 — `electron/main.ts:14-15`).

**Surfaces in scope**
- Titlebar + library sidebar + toolbar + song page + details panel + transport
- Guitar helper panel (opt-in), performance overlay, delete dialog
- Both shipped palettes (night-studio, atelier)

**Out of scope:** the ChordPro parser, transpose/scale libraries, the Electron
main process except window chrome, and `@singz/ui` internals except where the
app renders them.

**Primary user:** a working musician keeping a personal songbook — writing
chord charts, transposing them to a singable key, and reading them while
playing.

**Primary task:** open a song and read it while your hands are busy.
Everything else (editing, tagging, backing click, scale helper) is secondary.

**Constraints**
- The design language is `@singz/ui` night-studio, shared with SingZ. Deviating
  from it is a cost, not a freedom.
- React 18.3, Vite, Electron 31; offline-capable (fonts bundled).
- The kit's class names are a public contract (SingZ E2E selects on them).

**Reference points:** Ultimate Guitar, Chordify, OnSong, iReal Pro.

## Method note

The skill's default is to fan evidence-gathering out to subagents. This session
is configured not to spawn agents, so the orchestrator gathered all evidence
directly: computed-style and layout probes in the running app, `performance`
API measurements against the production build, and source reads. Every finding
below carries the same citation requirement — `file:line` or a measured value.

**Known gaps**
- Windows chrome (`WindowButtons`, frameless corners) was not exercised on
  Windows; only the macOS/browser path was measured.
- Time-to-interactive is a local-static-server measurement, not a cold-start
  Electron measurement.
- No user testing. Comprehension claims are inferred from labels and structure.
