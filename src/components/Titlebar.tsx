import type { ReactNode } from 'react'

/**
 * Macos-chrome-aware drag region. The window is `titleBarStyle: 'hiddenInset'`
 * so the traffic lights sit at top-left; we reserve their space then run
 * an `-webkit-app-region: drag` strip across the rest of the title row.
 */
export default function Titlebar({
  theme,
  right,
}: {
  theme: string
  right?: ReactNode
}) {
  return (
    <div className="titlebar" data-theme={theme}>
      <div className="titlebar-trafficlight-reserve" aria-hidden />
      <div className="titlebar-drag">
        <span className="titlebar-wordmark">
          <span className="titlebar-wordmark-glyph">♪</span>
          ChordZ
        </span>
      </div>
      <div className="titlebar-actions">{right}</div>
    </div>
  )
}
