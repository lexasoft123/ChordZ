import { useEffect, useRef, useState } from 'react'
import ChordDiagram from './ChordDiagram'

/**
 * A chord rendered above a lyric, with a hover/tap popover showing the
 * fingering diagram. Popover positions itself relative to the trigger
 * and avoids the viewport edges.
 */
export default function ChordToken({ chord }: { chord: string }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ left: number; top: number }>({ left: -9999, top: -9999 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    let frame = 0
    function place() {
      const trg = triggerRef.current
      const pop = popRef.current
      if (!trg || !pop) {
        // Popover not yet mounted; retry on next frame.
        frame = requestAnimationFrame(place)
        return
      }
      const r = trg.getBoundingClientRect()
      const pw = pop.offsetWidth
      const ph = pop.offsetHeight
      let left = r.left + r.width / 2 - pw / 2
      let top = r.bottom + 8
      const margin = 8
      if (left < margin) left = margin
      if (left + pw > window.innerWidth - margin) left = window.innerWidth - margin - pw
      if (top + ph > window.innerHeight - margin) top = r.top - ph - 8
      setCoords({ left, top })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  const openSoon = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setOpen(true)
  }
  const closeSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="chord-token"
        onMouseEnter={openSoon}
        onMouseLeave={closeSoon}
        onFocus={openSoon}
        onBlur={closeSoon}
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v) }}
        type="button"
      >
        {chord}
      </button>
      {open && (
        <div
          ref={popRef}
          className="chord-popover"
          role="tooltip"
          style={{ left: coords.left, top: coords.top }}
          onMouseEnter={openSoon}
          onMouseLeave={closeSoon}
        >
          <ChordDiagram chord={chord} size="md" />
        </div>
      )}
    </>
  )
}
