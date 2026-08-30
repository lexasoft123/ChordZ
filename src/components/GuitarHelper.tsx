import { useState } from 'react'
import { Fretboard } from './Fretboard'
import { FretboardControls } from './FretboardControls'
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
  initialRoot?: PitchClass
  initialScale?: ScaleTypeId
  onClose?: () => void
}

export default function GuitarHelper({
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
        No rail, and no chord palette.

        The rail toggled two panels, one of which — the chord palette — was the
        same "chords in this song" grid the details panel already draws. Three
        clicks to hide half of a helper you opened on purpose is furniture, so
        the helper is now the one thing it is for: the controls and the board.
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
      </div>
    </section>
  )
}

