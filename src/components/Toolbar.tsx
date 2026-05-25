import type { Song } from '../lib/chordpro'
import type { Mode } from './Workspace'

interface Props {
  song: Song
  mode: Mode
  onModeChange: (m: Mode) => void
  transpose: number
  onTransposeChange: (n: number) => void
  preferFlats: boolean
  onPreferFlatsChange: (v: boolean) => void
  metaOpen: boolean
  onMetaToggle: () => void
  onPerform: () => void
  onCapoChange: (capo: number) => void
  onTempoChange: (bpm: number) => void
  fontScale: number
  onFontScaleChange: (n: number) => void
  themeKey: 'atelier' | 'studio'
}

const FONT_SCALE_STEP = 0.1
const FONT_SCALE_MIN = 0.7
const FONT_SCALE_MAX = 2.2

export default function Toolbar(p: Props) {
  const capo = p.song.meta.capo ?? 0
  const tempo = p.song.meta.tempo ?? 0
  const key = p.song.meta.key ?? '—'

  return (
    <header className="toolbar">
      <div className="toolbar-row toolbar-row-title">
        <div className="toolbar-titleblock">
          <h1 className="toolbar-title">{p.song.meta.title}</h1>
          {p.song.meta.artist && (
            <div className="toolbar-subtitle">{p.song.meta.artist}</div>
          )}
        </div>
        <div className="toolbar-actions">
          <div className="mode-segmented" role="tablist">
            {(['preview', 'split', 'edit'] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={p.mode === m}
                data-active={p.mode === m ? '1' : '0'}
                className="mode-segmented-btn"
                onClick={() => p.onModeChange(m)}
              >
                {m === 'preview' ? 'Preview' : m === 'edit' ? 'Edit' : 'Split'}
              </button>
            ))}
          </div>
          <button
            className="toolbar-perform"
            onClick={p.onPerform}
            title="Performance mode"
          >
            Perform
          </button>
          <button
            className="toolbar-meta-toggle"
            data-active={p.metaOpen ? '1' : '0'}
            onClick={p.onMetaToggle}
            title="Toggle metadata"
            aria-label="Toggle metadata"
          >
            ⊟
          </button>
        </div>
      </div>

      <div className="toolbar-row toolbar-row-controls">
        <div className="toolbar-controls">
          <ControlGroup label="Key">
            <span className="control-readout">{key}</span>
          </ControlGroup>

          <ControlGroup label="Transpose">
            <button
              className="control-btn"
              onClick={() => p.onTransposeChange(p.transpose - 1)}
              aria-label="Transpose down"
            >−</button>
            <span className="control-readout control-readout-num">
              {p.transpose > 0 ? '+' : ''}{p.transpose}
            </span>
            <button
              className="control-btn"
              onClick={() => p.onTransposeChange(p.transpose + 1)}
              aria-label="Transpose up"
            >+</button>
          </ControlGroup>

          <ControlGroup label="Capo">
            <button
              className="control-btn"
              onClick={() => p.onCapoChange(Math.max(0, capo - 1))}
              aria-label="Lower capo"
            >−</button>
            <span className="control-readout control-readout-num">
              {capo === 0 ? '—' : capo}
            </span>
            <button
              className="control-btn"
              onClick={() => p.onCapoChange(Math.min(12, capo + 1))}
              aria-label="Raise capo"
            >+</button>
          </ControlGroup>

          <ControlGroup label="BPM">
            <input
              className="control-input"
              type="number"
              value={tempo || ''}
              placeholder="—"
              min={20}
              max={300}
              onChange={(e) => p.onTempoChange(parseInt(e.target.value, 10) || 0)}
            />
          </ControlGroup>

          <ControlGroup label="♭/♯">
            <button
              className="control-btn control-btn-toggle"
              data-active={p.preferFlats ? '1' : '0'}
              onClick={() => p.onPreferFlatsChange(!p.preferFlats)}
            >
              {p.preferFlats ? '♭' : '♯'}
            </button>
          </ControlGroup>

          <ControlGroup label="Size">
            <button
              className="control-btn control-btn-text"
              onClick={() => p.onFontScaleChange(Math.max(FONT_SCALE_MIN, p.fontScale - FONT_SCALE_STEP))}
              disabled={p.fontScale <= FONT_SCALE_MIN + 0.001}
              aria-label="Decrease text size"
              title="Decrease text size (⌘−)"
            >
              <span className="control-btn-text-small">A</span>
            </button>
            <button
              className="control-readout control-readout-num control-readout-reset"
              onClick={() => p.onFontScaleChange(1)}
              aria-label="Reset text size"
              title="Reset to 100% (⌘0)"
            >
              {Math.round(p.fontScale * 100)}%
            </button>
            <button
              className="control-btn control-btn-text"
              onClick={() => p.onFontScaleChange(Math.min(FONT_SCALE_MAX, p.fontScale + FONT_SCALE_STEP))}
              disabled={p.fontScale >= FONT_SCALE_MAX - 0.001}
              aria-label="Increase text size"
              title="Increase text size (⌘+)"
            >
              <span className="control-btn-text-large">A</span>
            </button>
          </ControlGroup>
        </div>
      </div>
    </header>
  )
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="control-group">
      <div className="control-label">{label}</div>
      <div className="control-row">{children}</div>
    </div>
  )
}
