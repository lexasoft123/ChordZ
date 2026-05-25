import { normalizeRoot, noteIndex } from './transpose'

/**
 * Guitar chord shapes, standard tuning E A D G B E (low-to-high).
 *
 * `frets[i]`: 0 = open, n>0 = fret n, null = muted string.
 * `fingers[i]`: 1..4 finger numbers, 0 = none (open or muted).
 * `baseFret`: starting fret offset for diagrams (1 = nut at top).
 * `barre`: fret (relative to baseFret) where index-finger barre sits.
 */
export interface ChordShape {
  name: string
  frets: (number | null)[]
  fingers: number[]
  baseFret: number
  barre?: number
}

const open = (
  name: string,
  frets: (number | null)[],
  fingers: number[],
  barre?: number,
): ChordShape => ({ name, frets, fingers, baseFret: 1, barre })

export const OPEN_SHAPES: Record<string, ChordShape> = {
  // Majors
  C: open('C', [null, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]),
  D: open('D', [null, null, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]),
  E: open('E', [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]),
  F: open('F', [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], 1),
  G: open('G', [3, 2, 0, 0, 0, 3], [3, 2, 0, 0, 0, 4]),
  A: open('A', [null, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]),
  B: open('B', [null, 2, 4, 4, 4, 2], [0, 1, 2, 3, 4, 1], 1),

  // Minors
  Cm: { name: 'Cm', frets: [null, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], baseFret: 3, barre: 1 },
  Dm: open('Dm', [null, null, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]),
  Em: open('Em', [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]),
  Fm: open('Fm', [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1], 1),
  Gm: { name: 'Gm', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 3, barre: 1 },
  Am: open('Am', [null, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]),
  Bm: { name: 'Bm', frets: [null, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], baseFret: 2, barre: 1 },

  // Dominant 7
  C7: open('C7', [null, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0]),
  D7: open('D7', [null, null, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3]),
  E7: open('E7', [0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]),
  G7: open('G7', [3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1]),
  A7: open('A7', [null, 0, 2, 0, 2, 0], [0, 0, 1, 0, 2, 0]),
  B7: open('B7', [null, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4]),

  // Minor 7
  Am7: open('Am7', [null, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0]),
  Dm7: open('Dm7', [null, null, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1]),
  Em7: open('Em7', [0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0]),

  // Major 7
  Cmaj7: open('Cmaj7', [null, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0]),
  Dmaj7: open('Dmaj7', [null, null, 0, 2, 2, 2], [0, 0, 0, 1, 1, 1]),
  Fmaj7: open('Fmaj7', [null, null, 3, 2, 1, 0], [0, 0, 3, 2, 1, 0]),
  Gmaj7: open('Gmaj7', [3, 2, 0, 0, 0, 2], [3, 2, 0, 0, 0, 1]),

  // sus / add
  Dsus2: open('Dsus2', [null, null, 0, 2, 3, 0], [0, 0, 0, 1, 2, 0]),
  Dsus4: open('Dsus4', [null, null, 0, 2, 3, 3], [0, 0, 0, 1, 2, 3]),
  Asus2: open('Asus2', [null, 0, 2, 2, 0, 0], [0, 0, 1, 2, 0, 0]),
  Asus4: open('Asus4', [null, 0, 2, 2, 3, 0], [0, 0, 1, 2, 3, 0]),
  Esus4: open('Esus4', [0, 2, 2, 2, 0, 0], [0, 1, 2, 3, 0, 0]),
}

/**
 * Generic barre templates rooted on the LOW E string (semitones above open E).
 * Used as a fallback for any chord we don't have an open shape for.
 *
 * Quality keys must match what we strip from a chord symbol.
 */
const E_TEMPLATES: Record<string, Omit<ChordShape, 'name' | 'baseFret'>> = {
  '':     { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: 1 },
  'm':    { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: 1 },
  '7':    { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barre: 1 },
  'm7':   { frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barre: 1 },
  'maj7': { frets: [1, 3, 2, 1, 1, 1], fingers: [1, 4, 3, 1, 1, 1], barre: 1 },
  'sus4': { frets: [1, 3, 3, 3, 1, 1], fingers: [1, 2, 3, 4, 1, 1], barre: 1 },
}

const QUALITY_ALIASES: Record<string, string> = {
  M: '',
  maj: '',
  min: 'm',
  '-': 'm',
  M7: 'maj7',
  Δ: 'maj7',
  Δ7: 'maj7',
  Mi7: 'm7',
  m7b5: 'm7',
  sus: 'sus4',
}

/**
 * Best-effort chord-shape lookup. Returns null if we can't render anything
 * sensible (e.g. malformed input).
 */
export function lookupChord(symbol: string): ChordShape | null {
  if (!symbol) return null
  // Strip optional bass for diagram (we draw the upper voicing only).
  const main = symbol.split('/')[0].trim()
  if (OPEN_SHAPES[main]) return OPEN_SHAPES[main]

  // Normalize flat root to sharp for lookup of open shapes,
  // and as semitone source for barre-template fallback.
  const rootMatch = main.match(/^([A-G](?:#|b)?)(.*)$/)
  if (!rootMatch) return null
  const root = normalizeRoot(rootMatch[1])
  const rawQuality = rootMatch[2]
  const quality = QUALITY_ALIASES[rawQuality] ?? rawQuality

  const normalizedSymbol = root + quality
  if (OPEN_SHAPES[normalizedSymbol]) return OPEN_SHAPES[normalizedSymbol]

  // semitones from open E (low string)
  const rootIdx = noteIndex(root)
  const eIdx = noteIndex('E')
  let baseFret = (rootIdx - eIdx + 12) % 12
  if (baseFret === 0) baseFret = 12

  const tmpl = E_TEMPLATES[quality] || E_TEMPLATES['']
  return {
    name: symbol,
    frets: tmpl.frets,
    fingers: tmpl.fingers,
    baseFret,
    barre: tmpl.barre,
  }
}
