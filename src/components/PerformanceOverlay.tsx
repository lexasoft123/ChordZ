import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/prefersMotion'
import { useModalLock } from '@singz/ui'
import type { Song } from '../lib/chordpro'
import Preview from './Preview'

export default function PerformanceOverlay({
  song,
  onClose,
  scrollSpeed,
  onScrollSpeedChange,
}: {
  song: Song
  onClose: () => void
  scrollSpeed: number
  onScrollSpeedChange: (n: number) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastTRef = useRef<number>(0)
  /*
   * The one animation the kit's CSS sweep cannot reach: this scroll is a rAF
   * loop, not a transition. When the machine asks for less movement the page
   * opens still and the player starts it — the control is right there, so
   * this removes surprise motion without removing the feature.
   */
  const [running, setRunning] = useState(() => !prefersReducedMotion())

  // Performance mode covers the whole app, so the kit's modal flag applies:
  // it is what tells background animations to stop invalidating pixels.
  useModalLock(true)

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
    <div className="perf-overlay">
      <div className="perf-overlay-bar">
        <span className="perf-overlay-title">{song.meta.title}</span>
        <div className="perf-overlay-controls">
          <button
            type="button"
            className="round-ghost"
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? 'Pause scroll' : 'Resume scroll'}
          >
            {running ? (
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
          <label className="perf-overlay-speed">
            <span className="eyebrow">speed</span>
            <input
              className="slider"
              type="range"
              min={4}
              max={120}
              value={scrollSpeed}
              onChange={(e) => onScrollSpeedChange(parseInt(e.target.value, 10))}
            />
          </label>
          <button
            type="button"
            className="round-ghost perf-overlay-close"
            onClick={onClose}
            title="Leave performance mode (Esc)"
            aria-label="Close performance mode"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
              <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="perf-overlay-scroll" ref={scrollRef}>
        <Preview song={song} />
        <div style={{ height: '60vh' }} aria-hidden />
      </div>
    </div>
  )
}
