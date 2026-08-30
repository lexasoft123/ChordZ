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

      {/*
        The rail is gone — it existed to hide the two halves of a helper you
        had just chosen to open — but the chord shapes are not. This is the
        guitar surface: someone who opens it wants the board AND the shapes,
        and the details panel is shut by default, so removing these left a
        guitarist with nowhere to see a fingering.
      */}
      <div className="guitar-helper-body">
        <div className="guitar-helper-board">
          <Fretboard
            rootPc={rootPc}
            scaleType={scaleType}
            selectedBox={selectedBox}
            onBoxChange={setSelectedBox}
            labelMode={labelMode}
          />
        </div>

        <aside className="guitar-helper-chords" aria-label="Chords in this song">
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
      </div>
    </section>
  )
}

