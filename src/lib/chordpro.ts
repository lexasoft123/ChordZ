/**
 * Minimal ChordPro parser / serializer.
 *
 * Supports:
 *  - {title}, {artist|subtitle|st}, {key}, {tempo|bpm}, {capo}, {tags|tag}
 *  - {start_of_verse|chorus|bridge|intro|outro} ... {end_of_*}
 *  - {comment|c: ...}
 *  - inline [chord]lyric segments
 *  - `#` line comments
 */

export type SectionKind = 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'tab'

export interface SongMeta {
  title: string
  artist?: string
  key?: string
  tempo?: number
  capo?: number
  tags?: string[]
}

export type Segment =
  | { type: 'text'; text: string }
  | { type: 'chord'; chord: string; text: string }

export interface Line {
  segments: Segment[]
}

export interface Section {
  kind: SectionKind
  label?: string
  lines: Line[]
}

export interface Song {
  id: string
  meta: SongMeta
  sections: Section[]
}

export function parseChordPro(src: string, id = cryptoRandomId()): Song {
  const meta: SongMeta = { title: 'Untitled' }
  const sections: Section[] = []
  // Wrapped in an object so callback mutations stay visible to control-flow analysis.
  const state: { current: Section | null } = { current: null }

  const open = (kind: SectionKind) => {
    const s: Section = { kind, lines: [] }
    state.current = s
    sections.push(s)
  }
  const ensure = (kind: SectionKind) => {
    if (!state.current || state.current.kind !== kind) open(kind)
  }

  for (const raw of src.split(/\r?\n/)) {
    const line = raw
    if (/^\s*#/.test(line)) continue

    const dir = line.match(/^\s*\{([^}]+)\}\s*$/)
    if (dir) {
      const inner = dir[1]
      const colon = inner.indexOf(':')
      const key = (colon >= 0 ? inner.slice(0, colon) : inner).trim().toLowerCase()
      const val = colon >= 0 ? inner.slice(colon + 1).trim() : ''
      applyDirective(meta, key, val, {
        open,
        close: () => { state.current = null },
        labelCurrent: (l) => { if (state.current) state.current.label = l },
      })
      continue
    }

    if (line.trim() === '') {
      // blank line ends an implicit section
      if (state.current && state.current.lines.length > 0) state.current = null
      continue
    }

    if (!state.current) ensure('verse')
    const segments = tokenizeLine(line)
    state.current!.lines.push({ segments })
  }

  return { id, meta, sections }
}

function applyDirective(
  meta: SongMeta,
  key: string,
  val: string,
  ctx: { open: (k: SectionKind) => void; close: () => void; labelCurrent: (l: string) => void },
) {
  switch (key) {
    case 'title':
    case 't':
      meta.title = val
      break
    case 'artist':
    case 'subtitle':
    case 'st':
      meta.artist = val
      break
    case 'key':
      meta.key = val
      break
    case 'tempo':
    case 'bpm': {
      const n = parseInt(val, 10)
      if (!Number.isNaN(n)) meta.tempo = n
      break
    }
    case 'capo': {
      const n = parseInt(val, 10)
      if (!Number.isNaN(n)) meta.capo = n
      break
    }
    case 'tags':
    case 'tag':
      meta.tags = val.split(',').map((s) => s.trim()).filter(Boolean)
      break
    case 'start_of_verse':
    case 'sov':
      ctx.open('verse')
      if (val) ctx.labelCurrent(val)
      break
    case 'end_of_verse':
    case 'eov':
      ctx.close()
      break
    case 'start_of_chorus':
    case 'soc':
      ctx.open('chorus')
      if (val) ctx.labelCurrent(val)
      break
    case 'end_of_chorus':
    case 'eoc':
      ctx.close()
      break
    case 'start_of_bridge':
    case 'sob':
      ctx.open('bridge')
      if (val) ctx.labelCurrent(val)
      break
    case 'end_of_bridge':
    case 'eob':
      ctx.close()
      break
    case 'intro':
      ctx.open('intro')
      break
    case 'outro':
      ctx.open('outro')
      break
    case 'comment':
    case 'c':
      ctx.labelCurrent(val)
      break
  }
}

function tokenizeLine(line: string): Segment[] {
  const segments: Segment[] = []
  const re = /\[([^\]]+)\]([^\[]*)/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  let matched = false
  while ((m = re.exec(line)) !== null) {
    matched = true
    if (m.index > lastIndex) {
      segments.push({ type: 'text', text: line.slice(lastIndex, m.index) })
    }
    segments.push({ type: 'chord', chord: m[1].trim(), text: m[2] })
    lastIndex = re.lastIndex
  }
  if (!matched) {
    segments.push({ type: 'text', text: line })
  } else if (lastIndex < line.length) {
    segments.push({ type: 'text', text: line.slice(lastIndex) })
  }
  return segments
}

export function serializeChordPro(song: Song): string {
  const out: string[] = []
  out.push(`{title: ${song.meta.title}}`)
  if (song.meta.artist) out.push(`{artist: ${song.meta.artist}}`)
  if (song.meta.key) out.push(`{key: ${song.meta.key}}`)
  if (song.meta.tempo) out.push(`{tempo: ${song.meta.tempo}}`)
  if (song.meta.capo) out.push(`{capo: ${song.meta.capo}}`)
  if (song.meta.tags?.length) out.push(`{tags: ${song.meta.tags.join(', ')}}`)
  out.push('')
  for (const s of song.sections) {
    out.push(`{start_of_${s.kind}}`)
    if (s.label) out.push(`{comment: ${s.label}}`)
    for (const ln of s.lines) {
      out.push(serializeLine(ln))
    }
    out.push(`{end_of_${s.kind}}`)
    out.push('')
  }
  return out.join('\n').trimEnd() + '\n'
}

function serializeLine(line: Line): string {
  let s = ''
  for (const seg of line.segments) {
    if (seg.type === 'text') s += seg.text
    else s += `[${seg.chord}]${seg.text}`
  }
  return s
}

export function collectChords(song: Song): string[] {
  const set = new Set<string>()
  for (const sec of song.sections) {
    for (const ln of sec.lines) {
      for (const seg of ln.segments) {
        if (seg.type === 'chord') set.add(seg.chord)
      }
    }
  }
  return [...set]
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'song_' + Math.random().toString(36).slice(2, 10)
}
