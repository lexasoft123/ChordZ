import { Button, Chip, SegmentedControl } from '@singz/ui'
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
}

const FONT_SCALE_STEP = 0.1
const FONT_SCALE_MIN = 0.7
const FONT_SCALE_MAX = 2.2

const MODES: { value: Mode; label: string }[] = [
  { value: 'preview', label: 'Preview' },
  { value: 'split', label: 'Split' },
  { value: 'edit', label: 'Edit' },
]

export default function Toolbar(p: Props) {
  const capo = p.song.meta.capo ?? 0
  const tempo = p.song.meta.tempo ?? 0
  const key = p.song.meta.key ?? '—'

  return (
    <header className="toolbar">
      <div className="toolbar-row toolbar-row-title">
        <div className="toolbar-titleblock">
          <h1 className="toolbar-title">{p.song.meta.title}</h1>
          {p.song.meta.artist && <div className="toolbar-subtitle">{p.song.meta.artist}</div>}
        </div>
        <div className="toolbar-actions">
          <SegmentedControl
            options={MODES}
            value={p.mode}
            onChange={p.onModeChange}
            aria-label="Editing mode"
          />
          <Button variant="primary" size="sm" onClick={p.onPerform} title="Performance mode">
            Perform
          </Button>
          <Button
            icon
            active={p.metaOpen}
            className="toolbar-meta-toggle"
            onClick={p.onMetaToggle}
            title="Toggle details panel"
            aria-label="Toggle details panel"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <rect
                x="1.5" y="2.5" width="11" height="9" rx="1.5"
                fill="none" stroke="currentColor" strokeWidth="1.1"
              />
              <line x1="8.6" y1="2.5" x2="8.6" y2="11.5" stroke="currentColor" strokeWidth="1.1" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="toolbar-row toolbar-row-controls">
        <div className="toolbar-controls">
          <ControlGroup label="Key">
            <span className="control-readout">{key}</span>
          </ControlGroup>

          <ControlGroup label="Transpose">
            <Stepper onClick={() => p.onTransposeChange(p.transpose - 1)} label="Transpose down" />
            <span className="control-readout control-readout-num">
              {p.transpose > 0 ? '+' : ''}
              {p.transpose}
            </span>
            <Stepper up onClick={() => p.onTransposeChange(p.transpose + 1)} label="Transpose up" />
          </ControlGroup>

          <ControlGroup label="Capo">
            <Stepper onClick={() => p.onCapoChange(Math.max(0, capo - 1))} label="Lower capo" />
            <span className="control-readout control-readout-num">{capo === 0 ? '—' : capo}</span>
            <Stepper up onClick={() => p.onCapoChange(Math.min(12, capo + 1))} label="Raise capo" />
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

          <ControlGroup label="Spelling">
            <Chip
              active={p.preferFlats}
              onClick={() => p.onPreferFlatsChange(!p.preferFlats)}
              title={p.preferFlats ? 'Spelling chords with flats' : 'Spelling chords with sharps'}
              aria-label="Toggle flats and sharps"
            >
              {p.preferFlats ? '♭' : '♯'}
            </Chip>
          </ControlGroup>

          <ControlGroup label="Size">
            <Chip
              onClick={() =>
                p.onFontScaleChange(Math.max(FONT_SCALE_MIN, p.fontScale - FONT_SCALE_STEP))
              }
              disabled={p.fontScale <= FONT_SCALE_MIN + 0.001}
              aria-label="Decrease text size"
              title="Decrease text size (⌘−)"
            >
              <span className="control-a-small">A</span>
            </Chip>
            <button
              type="button"
              className="control-readout control-readout-num control-readout-reset"
              onClick={() => p.onFontScaleChange(1)}
              aria-label="Reset text size"
              title="Reset to 100% (⌘0)"
            >
              {Math.round(p.fontScale * 100)}%
            </button>
            <Chip
              onClick={() =>
                p.onFontScaleChange(Math.min(FONT_SCALE_MAX, p.fontScale + FONT_SCALE_STEP))
              }
              disabled={p.fontScale >= FONT_SCALE_MAX - 0.001}
              aria-label="Increase text size"
              title="Increase text size (⌘+)"
            >
              <span className="control-a-large">A</span>
            </Chip>
          </ControlGroup>

          <ControlGroup label="Helper">
            <Chip
              wide
              active={p.showHelper}
              onClick={() => p.onShowHelperChange(!p.showHelper)}
              title="Toggle guitar helper (⌘⇧G)"
              aria-label="Toggle guitar helper"
            >
              Guitar
            </Chip>
          </ControlGroup>
        </div>
      </div>
    </header>
  )
}

/* No `active`, so no aria-pressed: a stepper fires once, it is not a
   toggle sitting in its off state. */
function Stepper({
  up = false,
  onClick,
  label,
}: {
  up?: boolean
  onClick: () => void
  label: string
}) {
  return (
    <Chip onClick={onClick} aria-label={label}>
      {up ? '+' : '−'}
    </Chip>
  )
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="control-group">
      <div className="eyebrow">{label}</div>
      <div className="control-row">{children}</div>
    </div>
  )
}
