import { atelier, tokens } from '@singz/ui/tokens'
import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { bridge } from './platform/bridge'
import { parseChordPro, serializeChordPro, type Song } from './lib/chordpro'
import { transposeSong } from './lib/transpose'
import { SAMPLE_SONGS } from './lib/samples'
import Workspace from './components/Workspace'
import ThemeSwitcher, { type ThemeMode } from './components/ThemeSwitcher'
import Titlebar from './components/Titlebar'

interface LibraryState {
  songs: Song[]
  selectedId: string | null
}

interface PrefState {
  theme: ThemeMode
  dark: boolean
  preferFlats: boolean
  fontScale: number
  showHelper: boolean
}


function paletteStyle(theme: string, dark: boolean): CSSProperties {
  const palette = theme === 'atelier' && !dark ? { ...tokens, ...atelier } : tokens
  return Object.fromEntries(Object.entries(palette).map(([key, value]) => [`--sz-${key}`, value])) as CSSProperties
}

const PREFS_KEY = 'chordz:prefs:v1'
const FONT_SCALE_MIN = 0.7
const FONT_SCALE_MAX = 2.2
const FONT_SCALE_STEP = 0.1

function clampScale(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Math.round(n * 100) / 100))
}

function loadPrefs(): PrefState {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) throw 0
    const p = JSON.parse(raw)
    return {
      theme: (p.theme as ThemeMode) || 'atelier',
      dark: !!p.dark,
      preferFlats: !!p.preferFlats,
      fontScale: clampScale(typeof p.fontScale === 'number' ? p.fontScale : 1),
      showHelper: !!p.showHelper,
    }
  } catch {
    return { theme: 'atelier', dark: false, preferFlats: false, fontScale: 1, showHelper: false }
  }
}

function savePrefs(p: PrefState) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)) } catch {}
}

function makeInitialLibrary(): LibraryState {
  const songs = SAMPLE_SONGS.map((s) => parseChordPro(s.source, s.id))
  return { songs, selectedId: songs[0]?.id ?? null }
}

export default function App() {
  const [{ songs, selectedId }, setLibrary] = useState<LibraryState>(makeInitialLibrary)
  const [prefs, setPrefs] = useState<PrefState>(loadPrefs)
  const [transposeBySong, setTransposeBySong] = useState<Record<string, number>>({})
  const hydratedRef = useRef(false)

  // Hydrate library from disk/localStorage
  useEffect(() => {
    let cancelled = false
    bridge.loadLibrary().then((raw) => {
      if (cancelled || !raw) return
      try {
        const parsed = JSON.parse(raw) as { sources: string[]; selectedId?: string | null }
        if (Array.isArray(parsed.sources) && parsed.sources.length) {
          const songsFromDisk = parsed.sources.map((src, i) => parseChordPro(src, `restored-${i}`))
          setLibrary({
            songs: songsFromDisk,
            selectedId: parsed.selectedId ?? songsFromDisk[0]?.id ?? null,
          })
        }
      } catch {
        /* corrupt — keep samples */
      } finally {
        hydratedRef.current = true
      }
    })
    return () => { cancelled = true }
  }, [])

  // Persist library
  useEffect(() => {
    if (!hydratedRef.current) return
    const payload = JSON.stringify({
      sources: songs.map((s) => serializeChordPro(s)),
      selectedId,
    })
    bridge.saveLibrary(payload)
  }, [songs, selectedId])

  useEffect(() => savePrefs(prefs), [prefs])

  // Apply dark class to document so OS chrome / scrollbars also feel right
  useEffect(() => {
    document.documentElement.dataset.dark = prefs.dark ? '1' : '0'
    document.documentElement.dataset.theme = prefs.theme
  }, [prefs.dark, prefs.theme])

  // Keyboard shortcuts: Cmd/Ctrl + / − / 0 control preview font size
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        setPrefs((p) => ({ ...p, fontScale: clampScale(p.fontScale + FONT_SCALE_STEP) }))
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        setPrefs((p) => ({ ...p, fontScale: clampScale(p.fontScale - FONT_SCALE_STEP) }))
      } else if (e.key === '0') {
        e.preventDefault()
        setPrefs((p) => ({ ...p, fontScale: 1 }))
      } else if (e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault()
        setPrefs((p) => ({ ...p, showHelper: !p.showHelper }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selectedSong = useMemo(
    () => songs.find((s) => s.id === selectedId) ?? null,
    [songs, selectedId],
  )
  const transpose = selectedSong ? transposeBySong[selectedSong.id] ?? 0 : 0

  const displaySong = useMemo<Song | null>(() => {
    if (!selectedSong) return null
    return transposeSong(selectedSong, transpose, prefs.preferFlats)
  }, [selectedSong, transpose, prefs.preferFlats])

  const updateSong = useCallback((next: Song) => {
    setLibrary((prev) => ({
      ...prev,
      songs: prev.songs.map((s) => (s.id === next.id ? next : s)),
    }))
  }, [])

  const updateSongSource = useCallback((id: string, source: string) => {
    setLibrary((prev) => ({
      ...prev,
      songs: prev.songs.map((s) => (s.id === id ? parseChordPro(source, id) : s)),
    }))
  }, [])

  const selectSong = useCallback((id: string) => {
    setLibrary((prev) => ({ ...prev, selectedId: id }))
  }, [])

  const newSong = useCallback(() => {
    const id = 'song_' + Date.now().toString(36)
    const source = `{title: Untitled}\n{key: C}\n{tempo: 100}\n{capo: 0}\n\n{start_of_verse}\nWrite [C]your [G]song here…\n{end_of_verse}\n`
    setLibrary((prev) => ({
      songs: [...prev.songs, parseChordPro(source, id)],
      selectedId: id,
    }))
    setTransposeBySong((t) => ({ ...t, [id]: 0 }))
  }, [])

  const deleteSong = useCallback((id: string) => {
    setLibrary((prev) => {
      const songs = prev.songs.filter((s) => s.id !== id)
      const selectedId = prev.selectedId === id ? songs[0]?.id ?? null : prev.selectedId
      return { songs, selectedId }
    })
  }, [])

  const setTranspose = useCallback((id: string, steps: number) => {
    setTransposeBySong((t) => ({ ...t, [id]: steps }))
  }, [])

  const workspaceProps = {
    songs,
    selectedSong,
    displaySong,
    transpose,
    onTransposeChange: (n: number) =>
      selectedSong && setTranspose(selectedSong.id, n),
    onSelectSong: selectSong,
    onUpdateSong: updateSong,
    onUpdateSongSource: updateSongSource,
    onNewSong: newSong,
    onDeleteSong: deleteSong,
    preferFlats: prefs.preferFlats,
    onPreferFlatsChange: (v: boolean) => setPrefs({ ...prefs, preferFlats: v }),
    dark: prefs.dark,
    onDarkChange: (v: boolean) => setPrefs({ ...prefs, dark: v }),
    fontScale: prefs.fontScale,
    onFontScaleChange: (n: number) =>
      setPrefs((p) => ({ ...p, fontScale: clampScale(n) })),
    showHelper: prefs.showHelper,
    onShowHelperChange: (v: boolean) => setPrefs((p) => ({ ...p, showHelper: v })),
  }

  return (
    <div style={paletteStyle(prefs.theme === 'compare' ? 'atelier' : prefs.theme, prefs.dark)} className={`app-root theme-${prefs.theme}`} data-dark={prefs.dark ? '1' : '0'}>
      <Titlebar
        theme={prefs.theme}
        right={
          <ThemeSwitcher
            value={prefs.theme}
            onChange={(t) => setPrefs({ ...prefs, theme: t })}
            dark={prefs.dark}
            onDarkChange={(v) => setPrefs({ ...prefs, dark: v })}
          />
        }
      />
      {prefs.theme === 'compare' ? (
        <div className="compare-split">
          <div style={paletteStyle('atelier', prefs.dark)} className="compare-pane theme-atelier" data-dark={prefs.dark ? '1' : '0'}>
            <div className="compare-label">Atelier</div>
            <Workspace {...workspaceProps} themeKey="atelier" compact />
          </div>
          <div style={paletteStyle('studio', prefs.dark)} className="compare-pane theme-studio" data-dark={prefs.dark ? '1' : '0'}>
            <div className="compare-label">Studio</div>
            <Workspace {...workspaceProps} themeKey="studio" compact />
          </div>
        </div>
      ) : (
        <Workspace {...workspaceProps} themeKey={prefs.theme} />
      )}
    </div>
  )
}
