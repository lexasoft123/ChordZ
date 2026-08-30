import { lookupChord, type ChordShape } from '../lib/chords'

/**
 * The fingering diagram. Every stroke width and colour comes from a
 * `--diagram-*` variable, so the same SVG reads correctly under both
 * palettes — a hairline that reads on tungsten dark needs more weight
 * behind it on paper.
 */
export default function ChordDiagram({
  chord,
  size = 'md',
  showName = true,
}: {
  chord: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}) {
  const shape = lookupChord(chord)
  if (!shape) {
    return (
      <div className={`chord-diagram chord-diagram-missing chord-diagram-${size}`}>
        <span className="chord-diagram-name">{chord}</span>
        <span className="chord-diagram-hint">?</span>
      </div>
    )
  }
  return (
    <div className={`chord-diagram chord-diagram-${size}`}>
      {showName && <div className="chord-diagram-name">{chord}</div>}
      <Diagram shape={shape} />
    </div>
  )
}

function Diagram({ shape }: { shape: ChordShape }) {
  const FRETS = 5
  const STRINGS = 6
  const W = 100
  const H = 120
  const padX = 12
  const padTop = 18
  const padBottom = 12
  const gridW = W - padX * 2
  const gridH = H - padTop - padBottom
  const stringStep = gridW / (STRINGS - 1)
  const fretStep = gridH / FRETS

  const stringX = (i: number) => padX + i * stringStep
  const fretY = (i: number) => padTop + i * fretStep

  // Display strings high-to-low (right-to-left in chord notation = left-to-right
  // visually). Our `frets` array is low-E to high-e, so reverse for drawing.
  const drawFrets = [...shape.frets].reverse()
  const drawFingers = [...shape.fingers].reverse()

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="chord-diagram-svg"
      role="img"
      aria-label={`Guitar chord diagram for ${shape.name}`}
    >
      {/* Base-fret marker (if not starting at the nut) */}
      {shape.baseFret > 1 && (
        <text
          x={padX - 4}
          y={padTop + fretStep / 2 + 3}
          className="chord-diagram-fretnum"
          textAnchor="end"
        >
          {shape.baseFret}fr
        </text>
      )}

      {/* Nut (only at top if baseFret === 1) */}
      {shape.baseFret === 1 && (
        <rect
          x={padX - 1}
          y={padTop - 3}
          width={gridW + 2}
          height={4}
          className="chord-diagram-nut"
        />
      )}

      {/* Fret lines */}
      {Array.from({ length: FRETS + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={padX}
          x2={padX + gridW}
          y1={fretY(i)}
          y2={fretY(i)}
          className="chord-diagram-fret"
        />
      ))}

      {/* Strings */}
      {Array.from({ length: STRINGS }).map((_, i) => (
        <line
          key={`str-${i}`}
          x1={stringX(i)}
          x2={stringX(i)}
          y1={padTop}
          y2={padTop + gridH}
          className="chord-diagram-string"
        />
      ))}

      {/* Open / muted markers above nut */}
      {drawFrets.map((f, i) => {
        const cx = stringX(i)
        const cy = padTop - 7
        if (f === null) {
          return (
            <g key={`mute-${i}`}>
              <line
                x1={cx - 3} y1={cy - 3} x2={cx + 3} y2={cy + 3}
                className="chord-diagram-mute"
              />
              <line
                x1={cx - 3} y1={cy + 3} x2={cx + 3} y2={cy - 3}
                className="chord-diagram-mute"
              />
            </g>
          )
        }
        if (f === 0) {
          return (
            <circle
              key={`open-${i}`}
              cx={cx}
              cy={cy}
              r={3.2}
              className="chord-diagram-open"
            />
          )
        }
        return null
      })}

      {/* Barre */}
      {shape.barre && (() => {
        const barreFret = shape.barre
        // find leftmost / rightmost strings that play this fret
        const playing: number[] = []
        drawFrets.forEach((f, i) => {
          if (f === barreFret) playing.push(i)
        })
        if (playing.length < 2) return null
        const fromI = Math.min(...playing)
        const toI = Math.max(...playing)
        return (
          <rect
            x={stringX(fromI) - 4}
            y={fretY(barreFret - 1) + fretStep / 2 - 4}
            width={stringX(toI) - stringX(fromI) + 8}
            height={8}
            rx={4}
            className="chord-diagram-barre"
          />
        )
      })()}

      {/* Dots (pressed frets) */}
      {drawFrets.map((f, i) => {
        if (f === null || f === 0) return null
        const finger = drawFingers[i]
        const cx = stringX(i)
        const cy = fretY(f - 1) + fretStep / 2
        return (
          <g key={`dot-${i}`}>
            <circle cx={cx} cy={cy} r={6.5} className="chord-diagram-dot" />
            {finger > 0 && (
              <text
                x={cx}
                y={cy + 2.5}
                textAnchor="middle"
                className="chord-diagram-finger"
              >
                {finger}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
