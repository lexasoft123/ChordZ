import { Button, SegmentedControl } from '@singz/ui'
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
  showHelper: boolean
  onShowHelperChange: (v: boolean) => void
  showHelperToggle: boolean
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
          <SegmentedControl<Mode>
            className="mode-segmented"
            options={[
              { value: 'preview', label: 'Preview' },
              { value: 'split', label: 'Split' },
              { value: 'edit', label: 'Edit' },
            ]}
            value={p.mode}
            onChange={p.onModeChange}
            aria-label="Editor mode"
          />
          <Button size="sm"
            variant="primary" className="toolbar-perform"
            onClick={p.onPerform}
            title="Performance mode"
          >
            Perform
          </Button>
          <Button size="sm"
            className="toolbar-meta-toggle"
            data-active={p.metaOpen ? '1' : '0'}
            onClick={p.onMetaToggle}
            title="Toggle metadata"
            aria-label="Toggle metadata"
          >
            ⊟
          </Button>
        </div>
      </div>

      <div className="toolbar-row toolbar-row-controls">
        <div className="toolbar-controls">
          <ControlGroup label="Key">
            <span className="control-readout">{key}</span>
          </ControlGroup>

          <ControlGroup label="Transpose">
            <Button size="sm"
              className="control-btn"
              onClick={() => p.onTransposeChange(p.transpose - 1)}
              aria-label="Transpose down"
            >−</Button>
            <span className="control-readout control-readout-num">
              {p.transpose > 0 ? '+' : ''}{p.transpose}
            </span>
            <Button size="sm"
              className="control-btn"
              onClick={() => p.onTransposeChange(p.transpose + 1)}
              aria-label="Transpose up"
            >+</Button>
          </ControlGroup>

          <ControlGroup label="Capo">
            <Button size="sm"
              className="control-btn"
              onClick={() => p.onCapoChange(Math.max(0, capo - 1))}
              aria-label="Lower capo"
            >−</Button>
            <span className="control-readout control-readout-num">
              {capo === 0 ? '—' : capo}
            </span>
            <Button size="sm"
              className="control-btn"
              onClick={() => p.onCapoChange(Math.min(12, capo + 1))}
              aria-label="Raise capo"
            >+</Button>
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
            <Button size="sm"
              className="control-btn control-btn-toggle"
              data-active={p.preferFlats ? '1' : '0'}
              onClick={() => p.onPreferFlatsChange(!p.preferFlats)}
            >
              {p.preferFlats ? '♭' : '♯'}
            </Button>
          </ControlGroup>

          <ControlGroup label="Size">
            <Button size="sm"
              className="control-btn control-btn-text"
              onClick={() => p.onFontScaleChange(Math.max(FONT_SCALE_MIN, p.fontScale - FONT_SCALE_STEP))}
              disabled={p.fontScale <= FONT_SCALE_MIN + 0.001}
              aria-label="Decrease text size"
              title="Decrease text size (⌘−)"
            >
              <span className="control-btn-text-small">A</span>
            </Button>
            <Button size="sm"
              className="control-readout control-readout-num control-readout-reset"
              onClick={() => p.onFontScaleChange(1)}
              aria-label="Reset text size"
              title="Reset to 100% (⌘0)"
            >
              {Math.round(p.fontScale * 100)}%
            </Button>
            <Button size="sm"
              className="control-btn control-btn-text"
              onClick={() => p.onFontScaleChange(Math.min(FONT_SCALE_MAX, p.fontScale + FONT_SCALE_STEP))}
              disabled={p.fontScale >= FONT_SCALE_MAX - 0.001}
              aria-label="Increase text size"
              title="Increase text size (⌘+)"
            >
              <span className="control-btn-text-large">A</span>
            </Button>
          </ControlGroup>

          {p.showHelperToggle && (
            <ControlGroup label="Helper">
              <Button size="sm"
                className="control-btn control-btn-toggle"
                data-active={p.showHelper ? '1' : '0'}
                onClick={() => p.onShowHelperChange(!p.showHelper)}
                title="Toggle guitar helper (⌘⇧G)"
                aria-label="Toggle guitar helper"
                aria-pressed={p.showHelper}
              >
                Guitar
              </Button>
            </ControlGroup>
          )}
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
