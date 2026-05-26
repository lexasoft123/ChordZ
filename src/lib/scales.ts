// Music theory primitives for the guitar helper.
// We use semitone indices (0..11) where 0 = C.

export const NOTE_NAMES_SHARP = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const

export const NOTE_NAMES_FLAT = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
] as const

export type PitchClass = number // 0..11

export type Accidental = 'sharp' | 'flat'

// Root selector uses both sharp and flat names so the user sees the
// conventional spelling (e.g. Bb not A#, Eb not D#).
export const ALL_ROOTS = [
  'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B',
] as const

// Which accidental style to use for a given root.
// Convention: C, G, D, A, E, B, F# → sharps. F, Bb, Eb, Ab, Db → flats.
// (Pitch class 6 is F# in our root list, so we lean sharp; Gb users would
// pick a different label.)
const FLAT_ROOT_PCS = new Set([5, 10, 3, 8, 1]) // F Bb Eb Ab Db
export function preferredAccidental(rootPc: PitchClass): Accidental {
  return FLAT_ROOT_PCS.has(rootPc) ? 'flat' : 'sharp'
}

export function noteName(pc: PitchClass, accidental: Accidental = 'sharp'): string {
  const names = accidental === 'flat' ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  return names[((pc % 12) + 12) % 12]
}

export function rootToPitchClass(root: string): PitchClass {
  const sharpIndex = NOTE_NAMES_SHARP.indexOf(root as typeof NOTE_NAMES_SHARP[number])
  if (sharpIndex >= 0) return sharpIndex
  const flatIndex = NOTE_NAMES_FLAT.indexOf(root as typeof NOTE_NAMES_FLAT[number])
  if (flatIndex >= 0) return flatIndex
  throw new Error(`Unknown root: ${root}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Guitar tuning
// ─────────────────────────────────────────────────────────────────────────────

// Standard tuning, low-to-high: E A D G B E.
export const STANDARD_TUNING_PC: PitchClass[] = [
  rootToPitchClass('E'), // 6th string (low E)
  rootToPitchClass('A'), // 5th string
  rootToPitchClass('D'), // 4th string
  rootToPitchClass('G'), // 3rd string
  rootToPitchClass('B'), // 2nd string
  rootToPitchClass('E'), // 1st string (high E)
]

export function fretPitchClass(openPc: PitchClass, fret: number): PitchClass {
  return (openPc + fret) % 12
}

// ─────────────────────────────────────────────────────────────────────────────
// Boxes
// ─────────────────────────────────────────────────────────────────────────────
//
// Box id. 0 = Open position (fixed at frets 0-3, not tied to the root).
// 1-5 = CAGED-style positions that shift with the key.
export type BoxId = 0 | 1 | 2 | 3 | 4 | 5

export type ScaleBox = {
  id: BoxId
  name: string
  // Offset (in frets) from the root fret on the 6th string where this
  // box's window begins. Ignored when `absolute` is true.
  startOffset: number
  // Number of frets the window spans (inclusive: from..from+span).
  span: number
  // When true, the window is absolute (frets startOffset..startOffset+span)
  // instead of relative to the root fret. Used for the open-position box.
  absolute?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Scale registry
// ─────────────────────────────────────────────────────────────────────────────

export type ScaleTypeId = 'major' | 'minor' | 'major-pent' | 'minor-pent'

export type ScaleType = {
  id: ScaleTypeId
  name: string
  shortName: string
  // All scale tones in semitones from the root.
  intervals: readonly number[]
  // 1-based degree labels (e.g. '1', 'b3', 'b5'). Same length as intervals.
  degreeLabels: readonly string[]
  // If set, this scale uses another scale's box windows. The fret windows are
  // identical; the notes drawn inside are filtered by THIS scale's intervals.
  borrowBoxesFrom?: ScaleTypeId
  // Required when borrowBoxesFrom is unset.
  boxes?: ScaleBox[]
  // Index into `intervals` of the "blue note" — rendered in a distinct color.
  bluesNoteIndex?: number
}

// Major scale boxes. Verified against the reference tab sheet for C major.
// C major root on low E = fret 8.
//   Box 1 → frets 2-6   (offset -6, span 4)  — B string needs fret 6 (F)
//   Box 2 → frets 4-8   (offset -4, span 4)  — G string needs fret 4 (B)
//   Box 3 → frets 7-10  (offset -1, span 3)
//   Box 4 → frets 9-13  (offset +1, span 4)
//   Box 5 → frets 12-15 (offset +4, span 3)
//   Open  → frets 0-3   (absolute, any key)
const MAJOR_BOXES: ScaleBox[] = [
  { id: 0, name: 'Open', startOffset: 0, span: 3, absolute: true },
  { id: 1, name: 'Box 1', startOffset: -6, span: 4 },
  { id: 2, name: 'Box 2', startOffset: -4, span: 4 },
  { id: 3, name: 'Box 3', startOffset: -1, span: 3 },
  { id: 4, name: 'Box 4', startOffset:  1, span: 4 },
  { id: 5, name: 'Box 5', startOffset:  4, span: 3 },
]

// Natural minor boxes. Offsets shift the major-scale shapes by +3 frets so
// that A minor (root fret 5) lands on the same physical positions as its
// relative major (C major, root fret 8). Verified against A minor:
//   Box 1 → frets 2-6   (offset -3, span 4)
//   Box 2 → frets 4-8   (offset -1, span 4)
//   Box 3 → frets 7-10  (offset +2, span 3)
//   Box 4 → frets 9-13  (offset +4, span 4)
//   Box 5 → frets 12-15 (offset +7, span 3)
const MINOR_BOXES: ScaleBox[] = [
  { id: 0, name: 'Open', startOffset: 0, span: 3, absolute: true },
  { id: 1, name: 'Box 1', startOffset: -3, span: 4 },
  { id: 2, name: 'Box 2', startOffset: -1, span: 4 },
  { id: 3, name: 'Box 3', startOffset:  2, span: 3 },
  { id: 4, name: 'Box 4', startOffset:  4, span: 4 },
  { id: 5, name: 'Box 5', startOffset:  7, span: 3 },
]

export const SCALES: Record<ScaleTypeId, ScaleType> = {
  'major': {
    id: 'major',
    name: 'Major',
    shortName: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degreeLabels: ['1', '2', '3', '4', '5', '6', '7'],
    boxes: MAJOR_BOXES,
  },
  'minor': {
    id: 'minor',
    name: 'Natural Minor',
    shortName: 'Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degreeLabels: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    boxes: MINOR_BOXES,
  },
  'major-pent': {
    id: 'major-pent',
    name: 'Major Pentatonic + b3',
    shortName: 'Maj Pent',
    // Major pentatonic (1 2 3 5 6) plus the b3 blue note.
    intervals: [0, 2, 3, 4, 7, 9],
    degreeLabels: ['1', '2', 'b3', '3', '5', '6'],
    borrowBoxesFrom: 'major',
    bluesNoteIndex: 2, // b3
  },
  'minor-pent': {
    id: 'minor-pent',
    name: 'Minor Pentatonic + b5',
    shortName: 'Min Pent',
    // Minor pentatonic (1 b3 4 5 b7) plus the b5 blue note.
    intervals: [0, 3, 5, 6, 7, 10],
    degreeLabels: ['1', 'b3', '4', 'b5', '5', 'b7'],
    borrowBoxesFrom: 'minor',
    bluesNoteIndex: 3, // b5
  },
}

// Resolve the box list for a scale, following borrowBoxesFrom once.
function resolveBoxes(scaleType: ScaleTypeId): ScaleBox[] {
  const scale = SCALES[scaleType]
  if (scale.boxes) return scale.boxes
  if (scale.borrowBoxesFrom) return SCALES[scale.borrowBoxesFrom].boxes!
  throw new Error(`Scale ${scaleType} has neither boxes nor borrowBoxesFrom`)
}

export function scaleBoxes(scaleType: ScaleTypeId): ScaleBox[] {
  return resolveBoxes(scaleType)
}

// ─────────────────────────────────────────────────────────────────────────────
// Scale-tone helpers (parameterised by scale type)
// ─────────────────────────────────────────────────────────────────────────────

// Returns the pitch classes of the scale for a given root.
export function scalePitchClasses(
  rootPc: PitchClass,
  scaleType: ScaleTypeId,
): PitchClass[] {
  return SCALES[scaleType].intervals.map((i) => (rootPc + i) % 12)
}

// Given a pitch class, return its 1-based degree in the scale or null if not
// in scale.
export function degreeInScale(
  pc: PitchClass,
  rootPc: PitchClass,
  scaleType: ScaleTypeId,
): number | null {
  const offset = ((pc - rootPc) % 12 + 12) % 12
  const idx = SCALES[scaleType].intervals.indexOf(offset)
  return idx >= 0 ? idx + 1 : null
}

export type FretNote = {
  stringIndex: number // 0 = low E, 5 = high E
  fret: number
  pc: PitchClass
  degree: number // 1-based index into the scale's intervals
  isRoot: boolean
  isBlues: boolean
}

// All scale tones on the fretboard within a fret range.
export function scaleNotesInRange(
  rootPc: PitchClass,
  tuning: PitchClass[],
  fromFret: number,
  toFret: number,
  scaleType: ScaleTypeId,
): FretNote[] {
  const result: FretNote[] = []
  const bluesIdx = SCALES[scaleType].bluesNoteIndex
  for (let s = 0; s < tuning.length; s++) {
    const openPc = tuning[s]
    for (let f = fromFret; f <= toFret; f++) {
      const pc = fretPitchClass(openPc, f)
      const degree = degreeInScale(pc, rootPc, scaleType)
      if (degree != null) {
        result.push({
          stringIndex: s,
          fret: f,
          pc,
          degree,
          isRoot: degree === 1,
          isBlues: bluesIdx != null && degree - 1 === bluesIdx,
        })
      }
    }
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Box geometry
// ─────────────────────────────────────────────────────────────────────────────

// Fret on the low E string where the root note sits (lowest instance, 0..11).
export function rootFretOnLowE(rootPc: PitchClass, tuning: PitchClass[]): number {
  const lowEOpen = tuning[0]
  return ((rootPc - lowEOpen) % 12 + 12) % 12
}

// Fret window (inclusive) for each box. Handles wrapping when the computed
// start would be negative (keys near the nut), and absolute windows for
// non-CAGED positions like the open-position box.
export function boxFretWindow(
  boxId: BoxId,
  rootPc: PitchClass,
  tuning: PitchClass[],
  scaleType: ScaleTypeId,
): { from: number; to: number } {
  const box = resolveBoxes(scaleType).find((b) => b.id === boxId)!
  if (box.absolute) {
    return { from: box.startOffset, to: box.startOffset + box.span }
  }
  const anchor = rootFretOnLowE(rootPc, tuning)
  let start = anchor + box.startOffset
  // CAGED tiles every 12 frets — wrap into the visible range when the
  // computed start falls outside [0, 15] so the box sits within the default
  // 0-18 fretboard. This means high-root keys (e.g. D minor) will see
  // Box 5 wrap to a lower octave instead of disappearing past the neck.
  if (start < 0) start += 12
  else if (start + box.span > 18) start -= 12
  return { from: start, to: start + box.span }
}

// Returns true when an open-position box is useful for this key + scale.
// Shown only when:
//   1. At least one open-string note is in the scale, AND
//   2. No CAGED box already starts at fret 0 (otherwise the open box would
//      be redundant — e.g. F major's Box 3 is at 0-3).
export function hasOpenPosition(
  rootPc: PitchClass,
  tuning: PitchClass[],
  scaleType: ScaleTypeId,
): boolean {
  const anyOpenInScale = tuning.some(
    (openPc) => degreeInScale(openPc, rootPc, scaleType) != null,
  )
  if (!anyOpenInScale) return false
  const cagedBoxes = resolveBoxes(scaleType).filter((b) => !b.absolute)
  const anyBoxAtZero = cagedBoxes.some(
    (b) => boxFretWindow(b.id, rootPc, tuning, scaleType).from === 0,
  )
  return !anyBoxAtZero
}

// Scale notes that fall inside a given box's window.
export function notesInBox(
  boxId: BoxId,
  rootPc: PitchClass,
  tuning: PitchClass[],
  scaleType: ScaleTypeId,
): FretNote[] {
  const { from, to } = boxFretWindow(boxId, rootPc, tuning, scaleType)
  return scaleNotesInRange(rootPc, tuning, from, to, scaleType)
}
