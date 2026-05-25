import type { Song, Segment } from './chordpro'

const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
const FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#',
  // weird-but-valid edge cases
  Cb: 'B', Fb: 'E', 'E#': 'F', 'B#': 'C',
}

export function normalizeRoot(note: string): string {
  return FLAT_TO_SHARP[note] || note
}

export function noteIndex(note: string): number {
  const idx = SHARP.indexOf(normalizeRoot(note) as (typeof SHARP)[number])
  return idx
}

export function shiftNote(note: string, semitones: number, useFlats = false): string {
  const idx = noteIndex(note)
  if (idx < 0) return note
  const next = ((idx + semitones) % 12 + 12) % 12
  return (useFlats ? FLAT : SHARP)[next]
}

/**
 * Transpose a chord symbol like "C", "Am7", "F#maj7", "G/B".
 * Quality / extensions are preserved verbatim; only roots shift.
 */
export function transposeChord(chord: string, semitones: number, useFlats = false): string {
  if (semitones === 0) return chord
  const trimmed = chord.trim()
  const m = trimmed.match(/^([A-G](?:#|b)?)(.*)$/)
  if (!m) return chord
  const root = m[1]
  const rest = m[2]
  const slash = rest.indexOf('/')
  const quality = slash >= 0 ? rest.slice(0, slash) : rest
  const bass = slash >= 0 ? rest.slice(slash + 1) : ''
  const newRoot = shiftNote(root, semitones, useFlats)
  const bassRoot = bass.match(/^([A-G](?:#|b)?)(.*)$/)
  const newBass = bassRoot
    ? shiftNote(bassRoot[1], semitones, useFlats) + bassRoot[2]
    : bass
  return newRoot + quality + (bass ? '/' + newBass : '')
}

export function transposeSong(song: Song, semitones: number, useFlats = false): Song {
  if (semitones === 0) return song
  const meta = {
    ...song.meta,
    key: song.meta.key ? transposeChord(song.meta.key, semitones, useFlats) : song.meta.key,
  }
  const sections = song.sections.map((s) => ({
    ...s,
    lines: s.lines.map((l) => ({
      segments: l.segments.map<Segment>((seg) =>
        seg.type === 'chord'
          ? { ...seg, chord: transposeChord(seg.chord, semitones, useFlats) }
          : seg,
      ),
    })),
  }))
  return { ...song, meta, sections }
}

/**
 * "Sounding" key when capo is applied: capo raises by N semitones,
 * so the sounding key is the chord shape transposed UP by the capo.
 */
export function soundingKey(shapeKey: string | undefined, capo: number): string | undefined {
  if (!shapeKey || !capo) return shapeKey
  return transposeChord(shapeKey, capo)
}
