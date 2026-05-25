import { useEffect, useRef, useState } from 'react'
import type { Song } from '../lib/chordpro'
import Preview from './Preview'

export default function PerformanceOverlay({
  song,
  onClose,
  scrollSpeed,
  onScrollSpeedChange,
  themeKey,
}: {
  song: Song
  onClose: () => void
  scrollSpeed: number
  onScrollSpeedChange: (n: number) => void
  themeKey: 'atelier' | 'studio'
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastTRef = useRef<number>(0)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') { e.preventDefault(); setRunning((r) => !r) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      return
    }
    const step = (t: number) => {
      const last = lastTRef.current || t
      const dt = (t - last) / 1000
      lastTRef.current = t
      const el = scrollRef.current
      if (el) el.scrollTop += scrollSpeed * dt
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTRef.current = 0
    }
  }, [running, scrollSpeed])

  return (
    <div className="perf-overlay" data-theme={themeKey}>
      <div className="perf-overlay-bar">
        <span className="perf-overlay-title">{song.meta.title}</span>
        <div className="perf-overlay-controls">
          <button
            className="perf-overlay-btn"
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? 'Pause scroll' : 'Resume scroll'}
          >
            {running ? '❚❚' : '▶'}
          </button>
          <label className="perf-overlay-speed">
            <span>speed</span>
            <input
              type="range"
              min={4}
              max={120}
              value={scrollSpeed}
              onChange={(e) => onScrollSpeedChange(parseInt(e.target.value, 10))}
            />
          </label>
          <button
            className="perf-overlay-btn perf-overlay-close"
            onClick={onClose}
            aria-label="Close performance mode"
          >✕</button>
        </div>
      </div>
      <div className="perf-overlay-scroll" ref={scrollRef}>
        <Preview song={song} themeKey={themeKey} />
        <div style={{ height: '60vh' }} aria-hidden />
      </div>
    </div>
  )
}
