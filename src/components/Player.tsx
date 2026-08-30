import { useEffect, useRef, useState } from 'react'
import { Button, SegmentedControl } from '@singz/ui'
import { bridge } from '../platform/bridge'
import type { Song } from '../lib/chordpro'

/**
 * Footer transport. Two modes share one bar:
 *  - File: load an mp3/wav and play it back (HTMLAudioElement)
 *  - Backing: WebAudio click + bass thump at the song's tempo
 */
interface PlayerProps {
  song: Song
  showHelper: boolean
  onShowHelperChange: (v: boolean) => void
  onError: (message: string) => void
}

type PlayerMode = 'backing' | 'file'

const MODES: { value: PlayerMode; label: string }[] = [
  { value: 'backing', label: 'Backing' },
  { value: 'file', label: 'File' },
]

export default function Player({ song, showHelper, onShowHelperChange, onError }: PlayerProps) {
  const [src, setSrc] = useState<string | null>(null)
  const [mode, setMode] = useState<PlayerMode>('backing')
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audio = useRef<HTMLAudioElement>(null)

  /*
   * The click track is owned here, not by the play button, so it follows the
   * tempo the bar is printing. It used to be captured once at play time:
   * editing BPM mid-song changed the number on screen and not the sound.
   */
  useEffect(() => {
    if (mode !== 'backing' || !playing) return
    const stop = startBackingClick(song.meta.tempo ?? 90)
    return stop
  }, [mode, playing, song.meta.tempo])

  const onLoadFile = async () => {
    let url: string | null = null
    try {
      url = await bridge.openAudioFile()
    } catch {
      onError('Could not open that file.')
      return
    }
    if (!url) return // the picker was cancelled — not a failure
    setSrc(url)
    setMode('file')
    setTimeout(() => audio.current?.play().catch(() => {}), 50)
  }

  const togglePlay = () => {
    if (mode === 'file') {
      const a = audio.current
      if (!a) return
      if (a.paused) { a.play(); setPlaying(true) }
      else { a.pause(); setPlaying(false) }
    } else {
      // The effect above starts and stops the click; this only says which.
      setPlaying((p) => !p)
    }
  }

  return (
    <footer className="player">
      <Button
        size="sm"
        active={showHelper}
        className="player-helper-toggle"
        onClick={() => onShowHelperChange(!showHelper)}
        title={showHelper ? 'Hide guitar helper (⌘⇧G)' : 'Show guitar helper (⌘⇧G)'}
        aria-label="Toggle guitar helper panel"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden style={{ display: 'block' }}>
          <rect x="1.5" y="2.5" width="11" height="9" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <line x1="5.2" y1="2.5" x2="5.2" y2="11.5" stroke="currentColor" strokeWidth="0.9" />
          <line x1="8.8" y1="2.5" x2="8.8" y2="11.5" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="3.4" cy="7" r="0.9" fill="currentColor" />
          <circle cx="7" cy="7" r="0.9" fill="currentColor" />
          <circle cx="10.6" cy="7" r="0.9" fill="currentColor" />
        </svg>
        Helper
        <span className="player-helper-caret" aria-hidden>{showHelper ? '▾' : '▴'}</span>
      </Button>

      <SegmentedControl
        options={MODES}
        value={mode}
        onChange={(m) => {
          setMode(m)
          setPlaying(false)
        }}
        aria-label="Playback source"
      />

      <button
        type="button"
        className="round-ghost player-play"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <rect x="2" y="1.5" width="3" height="9" rx="1" fill="currentColor" />
            <rect x="7" y="1.5" width="3" height="9" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <path d="M3 1.6 10.4 6 3 10.4z" fill="currentColor" />
          </svg>
        )}
      </button>

      <div className="player-track">
        {mode === 'file' ? (
          src ? (
            <>
              <span className="player-time">{formatTime(progress)}</span>
              <input
                className="slider seek player-scrubber"
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={progress}
                style={{ ['--p' as string]: `${duration ? (progress / duration) * 100 : 0}%` }}
                onChange={(e) => {
                  const a = audio.current
                  if (!a) return
                  const t = parseFloat(e.target.value)
                  a.currentTime = t
                  setProgress(t)
                }}
              />
              <span className="player-time">{formatTime(duration)}</span>
            </>
          ) : (
            <Button size="sm" onClick={onLoadFile}>
              Load audio file
            </Button>
          )
        ) : (
          <span className="player-tempo">{song.meta.tempo ?? 90} BPM · 4/4</span>
        )}
      </div>

      {mode === 'file' && src && (
        <button
          type="button"
          className="round-ghost"
          onClick={() => { setSrc(null); setPlaying(false) }}
          title="Eject"
          aria-label="Eject audio file"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <path d="M6 1.6 10.6 7H1.4z" fill="currentColor" />
            <rect x="1.4" y="8.6" width="9.2" height="1.8" rx="0.9" fill="currentColor" />
          </svg>
        </button>
      )}

      <audio
        ref={audio}
        src={src ?? undefined}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration || 0)}
        onTimeUpdate={(e) => setProgress((e.target as HTMLAudioElement).currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={(e) => {
          // Guarded on the element's own MediaError rather than on our `src`
          // state: ejecting a file clears the attribute, and the resulting
          // load-abort is not something to report. Only a real decode or
          // network failure sets .error.
          if (!e.currentTarget.error) return
          // Without this the bar kept the file loaded and offered a play
          // button that silently did nothing.
          setSrc(null)
          setPlaying(false)
          setDuration(0)
          setProgress(0)
          onError('Could not decode that audio file.')
        }}
      />
    </footer>
  )
}

function formatTime(sec: number): string {
  if (!isFinite(sec)) return '0:00'
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Lightweight WebAudio click track. Returns a stop function.
 */
function startBackingClick(bpm: number): () => void {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  const interval = 60 / Math.max(20, bpm)
  let beat = 0
  let stopped = false

  const tick = () => {
    if (stopped) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    // Downbeat: higher pitch; offbeats: low woody thump
    const isDown = beat % 4 === 0
    osc.frequency.value = isDown ? 1200 : 600
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(isDown ? 0.4 : 0.18, t + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.1)
    beat++
  }

  tick()
  const id = window.setInterval(tick, interval * 1000)
  return () => {
    stopped = true
    window.clearInterval(id)
    ctx.close().catch(() => {})
  }
}
