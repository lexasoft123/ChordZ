import { parseChordPro, serializeChordPro, type Song } from './chordpro.ts'

export interface LibraryState {
  songs: Song[]
  selectedId: string | null
}

export function decodeLibrary(raw: string): LibraryState {
  const parsed = JSON.parse(raw)
  if (!parsed || !Array.isArray(parsed.sources) || parsed.sources.some((s: unknown) => typeof s !== 'string')) {
    throw new Error('Invalid library sources')
  }
  const used = new Set<string>()
  const songs = parsed.sources.map((source: string, i: number) => {
    const stored = parsed.ids?.[i]
    let id = typeof stored === 'string' && stored ? stored : `restored-${i}`
    while (used.has(id)) id += '-duplicate'
    used.add(id)
    return parseChordPro(source, id)
  })
  const selectedId = used.has(parsed.selectedId) ? parsed.selectedId : songs[0]?.id ?? null
  return { songs, selectedId }
}

export function encodeLibrary(state: LibraryState): string {
  return JSON.stringify({
    sources: state.songs.map(serializeChordPro),
    ids: state.songs.map((song) => song.id),
    selectedId: state.selectedId,
  })
}
