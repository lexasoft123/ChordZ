import { useEffect, useRef, useState } from 'react'
import { bridge } from '../platform/bridge'
import type { Song } from '../lib/chordpro'

/**
 * Footer transport. Two modes share one bar:
 *  - File: load an mp3/wav and play it back (HTMLAudioElement)
 *  - Backing: WebAudio click + bass thump at the song's tempo
 */
interface PlayerProps {
  song: Song
  themeKey: 'atelier' | 'studio'
  showHelper?: boolean
  onShowHelperChange?: (v: boolean) => void
}

export default function Player({ song, themeKey, showHelper, onShowHelperChange }: PlayerProps) {
  const [src, setSrc] = useState<string | null>(null)
  const [mode, setMode] = useState<'file' | 'backing'>('backing')
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audio = useRef<HTMLAudioElement>(null)
  const tickStop = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => { tickStop.current?.() }
  }, [])

  const onLoadFile = async () => {
    const url = await bridge.openAudioFile()
    if (url) {
      setSrc(url)
      setMode('file')
      setTimeout(() => audio.current?.play().catch(() => {}), 50)
    }
  }

  const togglePlay = () => {
    if (mode === 'file') {
      const a = audio.current
      if (!a) return
      if (a.paused) { a.play(); setPlaying(true) }
      else { a.pause(); setPlaying(false) }
    } else {
      if (playing) {
        tickStop.current?.()
        tickStop.current = null
        setPlaying(false)
      } else {
        tickStop.current = startBackingClick(song.meta.tempo ?? 90)
        setPlaying(true)
      }
    }
  }

  return (
    <footer className="player" data-theme={themeKey}>
      {onShowHelperChange && (
        <button
          className="player-helper-toggle"
          data-active={showHelper ? '1' : '0'}
          aria-pressed={!!showHelper}
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
          <span className="player-helper-toggle-label">
            {themeKey === 'studio' ? 'HELPER' : 'Helper'}
          </span>
          <span className="player-helper-toggle-caret" aria-hidden>
            {showHelper ? '▾' : '▴'}
          </span>
        </button>
      )}
      <div className="player-mode">
        <button
          className="player-mode-btn"
          data-active={mode === 'backing' ? '1' : '0'}
          onClick={() => { setMode('backing'); tickStop.current?.(); setPlaying(false) }}
        >
          {themeKey === 'studio' ? 'BACKING' : 'Backing'}
        </button>
        <button
          className="player-mode-btn"
          data-active={mode === 'file' ? '1' : '0'}
          onClick={() => { setMode('file'); tickStop.current?.(); setPlaying(false) }}
        >
          {themeKey === 'studio' ? 'FILE' : 'File'}
        </button>
      </div>

      <button
        className="player-play"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? '❚❚' : '▶'}
      </button>

      <div className="player-track">
        {mode === 'file' ? (
          src ? (
            <>
              <span className="player-time">{formatTime(progress)}</span>
              <input
                className="player-scrubber"
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={progress}
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
            <button className="player-load" onClick={onLoadFile}>
              Load audio file
            </button>
          )
        ) : (
          <span className="player-tempo">
            {song.meta.tempo ?? 90} BPM · 4/4
          </span>
        )}
      </div>

      {mode === 'file' && src && (
        <button className="player-eject" onClick={() => { setSrc(null); setPlaying(false) }}>
          ⏏
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
