import { Button, WindowButtons } from '@singz/ui'
import { bridge } from '../platform/bridge'

/** The kit's two shipped palettes. */
export type Palette = 'night' | 'atelier'

/**
 * The window's top strip. `.titlebar` and the drag/no-drag rules come from
 * the kit, including the 92px of padding that clears the mac traffic lights
 * — hence no reserve element here.
 *
 * On Windows the frame is ours (main.ts opens the window with `frame: false`)
 * so the kit's three buttons are drawn instead of the native ones.
 */
export default function Titlebar({
  palette,
  onPaletteChange,
}: {
  palette: Palette
  onPaletteChange: (p: Palette) => void
}) {
  const isWin = typeof document !== 'undefined' && document.body.classList.contains('win')
  const controls = bridge.windowControls

  return (
    <div className="titlebar">
      <span className="logo">
        Chord<span>Z</span>
      </span>
      <span className="titlebar-tag">a musician's notebook</span>

      <div className="titlebar-fill" />

      <Button
        icon
        className="palette-btn no-drag"
        onClick={() => onPaletteChange(palette === 'night' ? 'atelier' : 'night')}
        title={palette === 'night' ? 'Daylight palette' : 'Night-studio palette'}
        aria-label="Toggle palette"
      >
        {palette === 'night' ? <SunIcon /> : <MoonIcon />}
      </Button>

      {isWin && controls && <WindowButtons api={controls} />}
    </div>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <circle cx="7" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <line x1="7" y1="0.8" x2="7" y2="2.4" />
        <line x1="7" y1="11.6" x2="7" y2="13.2" />
        <line x1="0.8" y1="7" x2="2.4" y2="7" />
        <line x1="11.6" y1="7" x2="13.2" y2="7" />
        <line x1="2.6" y1="2.6" x2="3.7" y2="3.7" />
        <line x1="10.3" y1="10.3" x2="11.4" y2="11.4" />
        <line x1="2.6" y1="11.4" x2="3.7" y2="10.3" />
        <line x1="10.3" y1="3.7" x2="11.4" y2="2.6" />
      </g>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M11.4 8.6A5 5 0 0 1 5.4 2.6a5 5 0 1 0 6 6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
