import {
  ALL_ROOTS,
  hasOpenPosition,
  noteName,
  preferredAccidental,
  rootToPitchClass,
  scaleBoxes,
  scalePitchClasses,
  SCALES,
  STANDARD_TUNING_PC,
  type BoxId,
  type PitchClass,
  type ScaleTypeId,
} from '../lib/scales'

type Props = {
  rootPc: PitchClass
  onRootChange: (pc: PitchClass) => void
  scaleType: ScaleTypeId
  onScaleTypeChange: (s: ScaleTypeId) => void
  selectedBox: BoxId | null
  onBoxChange: (box: BoxId | null) => void
  labelMode: 'note' | 'degree'
  onLabelModeChange: (m: 'note' | 'degree') => void
}

const SCALE_ORDER: ScaleTypeId[] = ['major', 'minor', 'major-pent', 'minor-pent']

export function FretboardControls({
  rootPc,
  onRootChange,
  scaleType,
  onScaleTypeChange,
  selectedBox,
  onBoxChange,
  labelMode,
  onLabelModeChange,
}: Props) {
  const scale = SCALES[scaleType]
  const scalePcs = scalePitchClasses(rootPc, scaleType)
  const acc = preferredAccidental(rootPc)
  const bluesIdx = scale.bluesNoteIndex

  return (
    <div className="gh-controls">
      <div className="gh-row">
        <div className="gh-group">
          <span className="gh-group-label">Root</span>
          <div className="gh-chip-row">
            {ALL_ROOTS.map((name) => {
              const pc = rootToPitchClass(name)
              return (
                <button
                  key={name}
                  onClick={() => onRootChange(pc)}
                  className="chip"
                  data-active={pc === rootPc}
                  data-tone="neutral"
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>

        <span aria-hidden className="gh-divider" />

        <div className="gh-group">
          <span className="gh-group-label">Scale</span>
          <div className="gh-chip-row">
            {SCALE_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => onScaleTypeChange(id)}
                className="chip"
                data-active={id === scaleType}
                title={SCALES[id].name}
              >
                {SCALES[id].shortName}
              </button>
            ))}
          </div>
        </div>

        <span aria-hidden className="gh-divider" />

        <div className="gh-group">
          <span className="gh-group-label">Box</span>
          <div className="gh-chip-row">
            <button
              onClick={() => onBoxChange(null)}
              className="chip"
              data-active={selectedBox === null}
            >
              All
            </button>
            {scaleBoxes(scaleType)
              .filter(
                (b) =>
                  b.id !== 0 ||
                  hasOpenPosition(rootPc, STANDARD_TUNING_PC, scaleType),
              )
              .map((b) => (
                <button
                  key={b.id}
                  onClick={() => onBoxChange(b.id)}
                  className="chip"
                  data-active={selectedBox === b.id}
                  title={b.name}
                >
                  {b.id === 0 ? 'Open' : <span className="mono">{b.id}</span>}
                </button>
              ))}
          </div>
        </div>

        <span aria-hidden className="gh-divider" />

        <div className="gh-group">
          <span className="gh-group-label">Labels</span>
          <div className="segmented">
            {(['note', 'degree'] as const).map((m) => (
              <button
                key={m}
                onClick={() => onLabelModeChange(m)}
                className="chip"
                data-active={labelMode === m}
              >
                {m === 'note' ? 'Notes' : 'Deg'}
              </button>
            ))}
          </div>
        </div>

        <span aria-hidden className="gh-divider gh-divider-tones" />

        <div className="gh-group gh-group-tones">
          <span className="gh-group-label">Tones</span>
          <div className="gh-chip-row">
            {scalePcs.map((pc, i) => {
              const isRoot = i === 0
              const isBlues = bluesIdx != null && i === bluesIdx
              const role = isRoot ? 'root' : isBlues ? 'blues' : 'tone'
              return (
                <span key={i} className="tone" data-role={role}>
                  <span className="deg">{scale.degreeLabels[i]}</span>
                  <span>{noteName(pc, acc)}</span>
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
