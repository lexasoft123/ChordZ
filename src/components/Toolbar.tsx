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
}

const MODES: { value: Mode; label: string }[] = [
  { value: 'preview', label: 'Preview' },
  { value: 'split', label: 'Split' },
  { value: 'edit', label: 'Edit' },
]

/*
 * One row.
 *
 * This bar used to be two rows and 137px tall, carrying fifteen controls, and
 * more than half of them were the song's own properties — key, tempo, capo —
 * which the details panel was editing at the same time. Properties belong to
 * the panel that edits them. What is left here is the three things you reach
 * for while READING: how the page is laid out (mode), what key you are reading
 * in (transpose + spelling), and the two ways out (perform, details).
 *
 * The song's facts still appear, as one read-only line under the title, so the
 * panel can stay shut without hiding what key you are in.
 */
export default function Toolbar(p: Props) {
  const { artist, key, tempo, capo } = p.song.meta
  const facts = [
    artist,
    key,
    tempo ? `${tempo} BPM` : null,
    capo ? `Capo ${capo}` : null,
  ].filter(Boolean)

  return (
    <header className="toolbar">
      <div className="toolbar-titleblock">
        <h1 className="toolbar-title">{p.song.meta.title}</h1>
        {facts.length > 0 && <div className="toolbar-facts">{facts.join(' · ')}</div>}
      </div>

      <div className="toolbar-actions">
        <div className="toolbar-group" role="group" aria-label="Transpose">
          <span className="eyebrow">Transpose</span>
          <Stepper onClick={() => p.onTransposeChange(p.transpose - 1)} label="Transpose down" />
          <span className="control-readout control-readout-num">
            {p.transpose > 0 ? '+' : ''}
            {p.transpose}
          </span>
          <Stepper up onClick={() => p.onTransposeChange(p.transpose + 1)} label="Transpose up" />
          <Chip
            active={p.preferFlats}
            onClick={() => p.onPreferFlatsChange(!p.preferFlats)}
            title={p.preferFlats ? 'Spelling chords with flats' : 'Spelling chords with sharps'}
            aria-label="Toggle flats and sharps"
          >
            {p.preferFlats ? '♭' : '♯'}
          </Chip>
        </div>

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
