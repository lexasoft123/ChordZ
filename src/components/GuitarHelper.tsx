import { useMemo, useState } from 'react'
import { Badge } from '@singz/ui'
import { Fretboard } from './Fretboard'
import { FretboardControls } from './FretboardControls'
import ChordDiagram from './ChordDiagram'
import { collectChords, type Song } from '../lib/chordpro'
import {
  noteName,
  preferredAccidental,
  rootToPitchClass,
  SCALES,
  type BoxId,
  type PitchClass,
  type ScaleTypeId,
} from '../lib/scales'

type Props = {
  song?: Song | null
  initialRoot?: PitchClass
  initialScale?: ScaleTypeId
  onClose?: () => void
}

export default function GuitarHelper({
  song,
  initialRoot,
  initialScale = 'major',
  onClose,
}: Props) {
  const [rootPc, setRootPc] = useState<PitchClass>(
    initialRoot ?? rootToPitchClass('C'),
  )
  const [scaleType, setScaleTypeRaw] = useState<ScaleTypeId>(initialScale)
  const [selectedBox, setSelectedBox] = useState<BoxId | null>(null)
  const [labelMode, setLabelMode] = useState<'note' | 'degree'>('note')

  // Section toggles — both visible by default.
  const [showFretboard, setShowFretboard] = useState(true)
  const [showChords, setShowChords] = useState(true)

  const setScaleType = (s: ScaleTypeId) => {
    setScaleTypeRaw(s)
    setSelectedBox(null)
  }

  const acc = preferredAccidental(rootPc)
  const rootName = noteName(rootPc, acc)
  const scaleShort = SCALES[scaleType].shortName

  const chords = useMemo(() => (song ? collectChords(song) : []), [song])

  return (
    <section className="guitar-helper" aria-label="Guitar scale helper">
      <header className="guitar-helper-head">
        <span className="eyebrow">Guitar Helper</span>
        <span className="gh-summary">
          <strong>{rootName}</strong>
          <span className="gh-summary-sep">·</span>
          <span className="gh-summary-scale">{scaleShort}</span>
          {selectedBox != null && (
            <>
              <span className="gh-summary-sep">·</span>
              <span className="gh-summary-box mono">
                {selectedBox === 0 ? 'Open' : `Box ${selectedBox}`}
              </span>
            </>
          )}
        </span>

        <span className="gh-tuning mono">E A D G B E</span>

        {onClose && (
          <button
            type="button"
            className="round-ghost gh-close"
            onClick={onClose}
            aria-label="Hide guitar helper"
            title="Hide guitar helper (⌘⇧G)"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
              <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </header>

      {showFretboard && (
        <FretboardControls
          rootPc={rootPc}
          onRootChange={setRootPc}
          scaleType={scaleType}
          onScaleTypeChange={setScaleType}
          selectedBox={selectedBox}
          onBoxChange={setSelectedBox}
          labelMode={labelMode}
          onLabelModeChange={setLabelMode}
        />
      )}

      <div
        className="guitar-helper-body"
        data-fretboard={showFretboard ? '1' : '0'}
        data-chords={showChords ? '1' : '0'}
      >
        <nav className="gh-rail" aria-label="Helper tools">
          <button
            type="button"
            className="gh-rail-btn"
            data-active={showFretboard ? '1' : '0'}
            aria-pressed={showFretboard}
            onClick={() => setShowFretboard((v) => !v)}
            title="Toggle fretboard"
          >
            <FretIcon />
            <span className="gh-rail-label">Fretboard</span>
          </button>
          <button
            type="button"
            className="gh-rail-btn"
            data-active={showChords ? '1' : '0'}
            aria-pressed={showChords}
            onClick={() => setShowChords((v) => !v)}
            title="Toggle chord palette"
          >
            <ChordIcon />
            <span className="gh-rail-label">Chords</span>
            {chords.length > 0 && <Badge className="gh-rail-badge">{chords.length}</Badge>}
          </button>
        </nav>

        {showFretboard && (
          <div className="guitar-helper-board">
            <Fretboard
              rootPc={rootPc}
              scaleType={scaleType}
              selectedBox={selectedBox}
              onBoxChange={setSelectedBox}
              labelMode={labelMode}
            />
          </div>
        )}

        {showChords && (
          <aside className="guitar-helper-chords" aria-label="Chords in song">
            <div className="gh-chords-head">
              <span className="eyebrow">Chords</span>
              <Badge className="mono">{chords.length}</Badge>
            </div>
            <div className="gh-chords-grid">
              {chords.length === 0 ? (
                <div className="gh-chords-empty">no chords yet</div>
              ) : (
                chords.map((c) => <ChordDiagram key={c} chord={c} size="sm" />)
              )}
            </div>
          </aside>
        )}

        {!showFretboard && !showChords && (
          <div className="gh-empty-state">
            Both panels are hidden — toggle Fretboard or Chords above to show them.
          </div>
        )}
      </div>
    </section>
  )
}

function FretIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
      style={{ display: 'block' }}
    >
      <rect x="1.5" y="2.5" width="11" height="9" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <line x1="5.2" y1="2.5" x2="5.2" y2="11.5" stroke="currentColor" strokeWidth="0.9" />
      <line x1="8.8" y1="2.5" x2="8.8" y2="11.5" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="3.4" cy="7" r="0.9" fill="currentColor" />
      <circle cx="7" cy="7" r="0.9" fill="currentColor" />
      <circle cx="10.6" cy="7" r="0.9" fill="currentColor" />
    </svg>
  )
}

function ChordIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden
      style={{ display: 'block' }}
    >
      <rect x="2.5" y="2" width="9" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="2.5" y1="4" x2="11.5" y2="4" stroke="currentColor" strokeWidth="1.4" />
      <line x1="5.5" y1="4" x2="5.5" y2="12" stroke="currentColor" strokeWidth="0.7" />
      <line x1="8.5" y1="4" x2="8.5" y2="12" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="5.5" cy="7" r="1" fill="currentColor" />
      <circle cx="8.5" cy="9.5" r="1" fill="currentColor" />
    </svg>
  )
}
