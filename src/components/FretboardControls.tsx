import { Chip, SegmentedControl } from '@singz/ui'
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

const LABEL_MODES = [
  { value: 'note' as const, label: 'Notes' },
  { value: 'degree' as const, label: 'Deg' },
]

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
          <span className="eyebrow">Root</span>
          <div className="gh-chip-row">
            {ALL_ROOTS.map((name) => {
              const pc = rootToPitchClass(name)
              return (
                <Chip key={name} active={pc === rootPc} onClick={() => onRootChange(pc)}>
                  {name}
                </Chip>
              )
            })}
          </div>
        </div>

        <span aria-hidden className="gh-divider" />

        <div className="gh-group">
          <span className="eyebrow">Scale</span>
          <div className="gh-chip-row">
            {SCALE_ORDER.map((id) => (
              <Chip
                key={id}
                wide
                active={id === scaleType}
                onClick={() => onScaleTypeChange(id)}
                title={SCALES[id].name}
              >
                {SCALES[id].shortName}
              </Chip>
            ))}
          </div>
        </div>

        <span aria-hidden className="gh-divider" />

        <div className="gh-group">
          <span className="eyebrow">Box</span>
          <div className="gh-chip-row">
            <Chip
              wide
              active={selectedBox === null}
              onClick={() => onBoxChange(null)}
            >
              All
            </Chip>
            {scaleBoxes(scaleType)
              .filter(
                (b) =>
                  b.id !== 0 ||
                  hasOpenPosition(rootPc, STANDARD_TUNING_PC, scaleType),
              )
              .map((b) => (
                <Chip
                  key={b.id}
                  wide={b.id === 0}
                  active={selectedBox === b.id}
                  onClick={() => onBoxChange(b.id)}
                  title={b.name}
                >
                  {b.id === 0 ? 'Open' : <span className="mono">{b.id}</span>}
                </Chip>
              ))}
          </div>
        </div>

        <span aria-hidden className="gh-divider" />

        <div className="gh-group">
          <span className="eyebrow">Labels</span>
          <SegmentedControl
            options={LABEL_MODES}
            value={labelMode}
            onChange={onLabelModeChange}
            aria-label="Note labels"
          />
        </div>

        <span aria-hidden className="gh-divider gh-divider-tones" />

        <div className="gh-group gh-group-tones">
          <span className="eyebrow">Tones</span>
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
