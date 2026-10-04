import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { bridge } from './platform/bridge'
import { parseChordPro, type Song } from './lib/chordpro'
import { transposeSong } from './lib/transpose'
import { SAMPLE_SONGS } from './lib/samples'
import { decodeLibrary, encodeLibrary, type LibraryState } from './lib/library'
import { prefersLight } from './lib/prefersMotion'
import Workspace from './components/Workspace'
import Titlebar, { type Palette } from './components/Titlebar'
import Toast from './components/Toast'

/** What the last write to disk did. The sidebar footer says so in words.
 *  'off' is the read-failed case: writing stays disabled for the session so
 *  an unreadable library is not overwritten, and the footer has to keep
 *  saying so — the toast that explained it is long gone by then. */
export type SaveState = 'idle' | 'saving' | 'saved' | 'failed' | 'off'

interface PrefState {
  palette: Palette
  preferFlats: boolean
  fontScale: number
  showHelper: boolean
  metaOpen: boolean
}

const PREFS_KEY = 'chordz:prefs:v2'
const FONT_SCALE_MIN = 0.7
const FONT_SCALE_MAX = 2.2
const FONT_SCALE_STEP = 0.1

function clampScale(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Math.round(n * 100) / 100))
}

function loadPrefs(): PrefState {
  try {
    const raw = localStorage.getItem(PREFS_KEY) ?? localStorage.getItem('chordz:prefs:v1')
    if (!raw) throw 0
    const p = JSON.parse(raw)
    return {
      // A stored choice always wins, and stays won. The OS only decides for
      // someone who has never expressed one.
      palette: p.palette === 'atelier' || (!p.palette && p.theme === 'atelier' && !p.dark) ? 'atelier' : 'night',
      preferFlats: !!p.preferFlats,
      fontScale: clampScale(typeof p.fontScale === 'number' ? p.fontScale : 1),
      showHelper: !!p.showHelper,
      metaOpen: !!p.metaOpen,
    }
  } catch {
    // No stored preference: follow the machine. A laptop set to a light
    // appearance used to open this app in the dark anyway.
    return {
      palette: prefersLight() ? 'atelier' : 'night',
      preferFlats: false,
      fontScale: 1,
      showHelper: false,
      metaOpen: false,
    }
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
  const [{ songs, selectedId }, setLibrary] = useState<LibraryState>({ songs: [], selectedId: null })
  const [prefs, setPrefs] = useState<PrefState>(loadPrefs)
  const [transposeBySong, setTransposeBySong] = useState<Record<string, number>>({})
  const [hydrating, setHydrating] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [toast, setToast] = useState<{ n: number; message: string } | null>(null)
  const toastCount = useRef(0)

  /*
   * Writing is off until a read has succeeded. If the library on disk could
   * not be parsed, the app must not then serialise its empty state over the
   * top of it — a visible error that destroys the file it is reporting is
   * worse than the silent failure it replaced.
   */
  const canSave = useRef(false)

  const notify = useCallback((message: string) => {
    toastCount.current += 1
    setToast({ n: toastCount.current, message })
  }, [])

  // Hydrate the library from disk. Nothing renders as "yours" until this
  // settles: the app used to show sample songs and then swap them out, so the
  // first thing you saw was content that was not yours.
  useEffect(() => {
    let cancelled = false
    bridge
      .loadLibrary()
      .then((raw) => {
        if (cancelled) return
        if (raw === null) {
          // Genuinely empty — a first run. Samples are a welcome, not a patch.
          setLibrary(makeInitialLibrary())
          canSave.current = true
          return
        }
        try {
          setLibrary(decodeLibrary(raw))
          canSave.current = true
        } catch {
          setSaveState('off')
          notify(
            'Your library file could not be read, so nothing has been loaded. ' +
              'Saving is off for this session so the file is not overwritten.',
          )
        }
      })
      .catch(() => {
        if (cancelled) return
        setSaveState('off')
        notify('Your library could not be opened. Saving is off for this session.')
      })
      .finally(() => {
        if (!cancelled) setHydrating(false)
      })
    return () => { cancelled = true }
  }, [notify])

  // Persist the library.
  useEffect(() => {
    if (hydrating || !canSave.current) return
    const payload = encodeLibrary({ songs, selectedId })
    setSaveState('saving')
    let cancelled = false
    bridge
      .saveLibrary(payload)
      .then((ok) => {
        if (cancelled) return
        setSaveState(ok ? 'saved' : 'failed')
        if (!ok) {
          notify('Could not save to disk. Your changes are still here, but not written yet.')
        }
      })
      .catch(() => {
        if (cancelled) return
        setSaveState('failed')
        notify('Could not save to disk. Your changes are still here, but not written yet.')
      })
    return () => { cancelled = true }
  }, [songs, selectedId, hydrating, notify])

  useEffect(() => savePrefs(prefs), [prefs])

  // The kit ships the light palette; switching it on is one attribute.
  // On <html>, not on a wrapper: the modal scrim and the ambient layers
  // both render outside the app subtree.
  useEffect(() => {
    const root = document.documentElement
    if (prefs.palette === 'atelier') root.setAttribute('data-sz-palette', 'atelier')
    else root.removeAttribute('data-sz-palette')
  }, [prefs.palette])

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

  return (
    <div className="app">
      <Titlebar
        palette={prefs.palette}
        onPaletteChange={(palette) => setPrefs((p) => ({ ...p, palette }))}
      />
      <Workspace
        hydrating={hydrating}
        saveState={saveState}
        onError={notify}
        songs={songs}
        selectedSong={selectedSong}
        displaySong={displaySong}
        transpose={transpose}
        onTransposeChange={(n) => selectedSong && setTranspose(selectedSong.id, n)}
        onSelectSong={selectSong}
        onUpdateSong={updateSong}
        onUpdateSongSource={updateSongSource}
        onNewSong={newSong}
        onDeleteSong={deleteSong}
        preferFlats={prefs.preferFlats}
        onPreferFlatsChange={(v) => setPrefs((p) => ({ ...p, preferFlats: v }))}
        fontScale={prefs.fontScale}
        onFontScaleChange={(n) => setPrefs((p) => ({ ...p, fontScale: clampScale(n) }))}
        showHelper={prefs.showHelper}
        onShowHelperChange={(v) => setPrefs((p) => ({ ...p, showHelper: v }))}
        metaOpen={prefs.metaOpen}
        onMetaOpenChange={(v) => setPrefs((p) => ({ ...p, metaOpen: v }))}
      />
      {toast && (
        <Toast key={toast.n} message={toast.message} onDismiss={() => setToast(null)} />
      )}
    </div>
  )
}
