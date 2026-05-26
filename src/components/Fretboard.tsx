import { useEffect, useMemo, useRef, useState } from 'react'
import {
  boxFretWindow,
  hasOpenPosition,
  noteName,
  notesInBox,
  preferredAccidental,
  scaleBoxes,
  scaleNotesInRange,
  SCALES,
  STANDARD_TUNING_PC,
  type BoxId,
  type PitchClass,
  type ScaleTypeId,
} from '../lib/scales'

type Props = {
  rootPc: PitchClass
  scaleType: ScaleTypeId
  selectedBox: BoxId | null
  onBoxChange?: (box: BoxId | null) => void
  fromFret?: number
  toFret?: number
  labelMode?: 'note' | 'degree'
}

const STRING_COUNT = 6
const FRET_WIDTH = 64
const NUT_WIDTH = 10
const PAD_LEFT = 50
const PAD_RIGHT = 14
const PAD_TOP = 50
const PAD_BOTTOM = 30

const STRING_GAP_DESKTOP = 42
const STRING_GAP_MOBILE = 64

const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E']

const SINGLE_INLAYS = new Set([3, 5, 7, 9, 15, 17, 19, 21])
const DOUBLE_INLAYS = new Set([12, 24])

const BOX_COLORS: Record<BoxId, string> = {
  0: '#22d3ee',
  1: '#f5b942',
  2: '#5e9bff',
  3: '#34d399',
  4: '#b073f5',
  5: '#f87171',
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  )
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

export function Fretboard({
  rootPc,
  scaleType,
  selectedBox,
  onBoxChange,
  fromFret = 0,
  toFret = 18,
  labelMode = 'note',
}: Props) {
  const isMobile = useIsMobile()
  const STRING_GAP = isMobile ? STRING_GAP_MOBILE : STRING_GAP_DESKTOP

  const fretCount = toFret - fromFret + 1

  const width = PAD_LEFT + NUT_WIDTH + fretCount * FRET_WIDTH + PAD_RIGHT
  const height = PAD_TOP + (STRING_COUNT - 1) * STRING_GAP + PAD_BOTTOM

  const scale = SCALES[scaleType]

  const notes = useMemo(
    () => scaleNotesInRange(rootPc, STANDARD_TUNING_PC, fromFret, toFret, scaleType),
    [rootPc, fromFret, toFret, scaleType],
  )

  const activeWindow = selectedBox
    ? boxFretWindow(selectedBox, rootPc, STANDARD_TUNING_PC, scaleType)
    : null

  const boxExtents = useMemo(() => {
    const hasOpen = hasOpenPosition(rootPc, STANDARD_TUNING_PC, scaleType)
    return scaleBoxes(scaleType)
      .filter((b) => b.id !== 0 || hasOpen)
      .map((b) => {
        const boxNotes = notesInBox(b.id, rootPc, STANDARD_TUNING_PC, scaleType)
        const perString: { minFret: number; maxFret: number }[] = []
        for (let s = 0; s < 6; s++) {
          const stringNotes = boxNotes.filter((n) => n.stringIndex === s)
          if (stringNotes.length === 0) {
            const w = boxFretWindow(b.id, rootPc, STANDARD_TUNING_PC, scaleType)
            perString.push({ minFret: w.from, maxFret: w.to })
          } else {
            perString.push({
              minFret: Math.min(...stringNotes.map((n) => n.fret)),
              maxFret: Math.max(...stringNotes.map((n) => n.fret)),
            })
          }
        }
        return { box: b, perString }
      })
  }, [rootPc, scaleType])

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!selectedBox || !scrollRef.current) return
    const window = boxFretWindow(selectedBox, rootPc, STANDARD_TUNING_PC, scaleType)
    const container = scrollRef.current
    const id = setTimeout(() => {
      const containerWidth = container.clientWidth
      const scrollWidth = container.scrollWidth
      if (containerWidth >= scrollWidth) return
      const scaleX = scrollWidth / width
      const boxCenterSvg =
        PAD_LEFT + NUT_WIDTH +
        ((window.from + window.to) / 2 - fromFret) * FRET_WIDTH
      const boxCenterPx = boxCenterSvg * scaleX
      const maxScroll = scrollWidth - containerWidth
      const target = Math.max(0, Math.min(maxScroll, boxCenterPx - containerWidth / 2))
      container.scrollLeft = target
    }, 50)
    return () => clearTimeout(id)
  }, [selectedBox, rootPc, scaleType, width, fromFret])

  const fretX = (fret: number) => {
    if (fret === 0) return PAD_LEFT - 18
    const relative = fret - fromFret
    return PAD_LEFT + NUT_WIDTH + relative * FRET_WIDTH - FRET_WIDTH / 2
  }

  const stringY = (stringIndex: number) => {
    const visualRow = (STRING_COUNT - 1) - stringIndex
    return PAD_TOP + visualRow * STRING_GAP
  }

  const fretboardTop = PAD_TOP - 12
  const fretboardBottom = PAD_TOP + (STRING_COUNT - 1) * STRING_GAP + 12
  const fretboardLeft = PAD_LEFT
  const fretboardRight = PAD_LEFT + NUT_WIDTH + fretCount * FRET_WIDTH

  return (
    <div ref={scrollRef} className="fretboard-host">
      <svg
        role="img"
        aria-label="Guitar fretboard"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="fretboard-svg"
        style={{
          width: '100%',
          height: '100%',
          minWidth: '760px',
          maxHeight: '100%',
        }}
      >
        <defs>
          <linearGradient id="board" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--fb-board-top, #1e2533)" />
            <stop offset="100%" stopColor="var(--fb-board-bot, #141923)" />
          </linearGradient>

          <radialGradient id="inlay" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e8eaf0" />
            <stop offset="55%" stopColor="#9aa3b5" />
            <stop offset="100%" stopColor="#4a5160" />
          </radialGradient>

          <radialGradient id="noteTone" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#9bc0ff" />
            <stop offset="55%" stopColor="#5e9bff" />
            <stop offset="100%" stopColor="#2a5cb8" />
          </radialGradient>

          <radialGradient id="noteRoot" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ff8585" />
            <stop offset="50%" stopColor="#ef4a4a" />
            <stop offset="100%" stopColor="#9a1d1d" />
          </radialGradient>

          <radialGradient id="noteBlues" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#daaaff" />
            <stop offset="50%" stopColor="#b073f5" />
            <stop offset="100%" stopColor="#6c30b3" />
          </radialGradient>

          <linearGradient id="nut" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dde1e8" />
            <stop offset="100%" stopColor="#9aa0ad" />
          </linearGradient>

          <filter id="noteShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.7" />
            <feOffset dx="0" dy="0.8" result="offset" />
            <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x={fretboardLeft}
          y={fretboardTop}
          width={fretboardRight - fretboardLeft}
          height={fretboardBottom - fretboardTop}
          fill="url(#board)"
          rx="3"
        />
        <rect
          x={fretboardLeft + 0.5}
          y={fretboardTop + 0.5}
          width={fretboardRight - fretboardLeft - 1}
          height={fretboardBottom - fretboardTop - 1}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          rx="3"
        />

        {boxExtents.map(({ box, perString }) => {
          const isActive = selectedBox === box.id
          const dimmed = selectedBox !== null && !isActive
          const color = BOX_COLORS[box.id]

          const padX = 14
          const halfRow = STRING_GAP / 2

          const rows: { left: number; right: number; yTop: number; yBot: number }[] = []
          for (let vis = 0; vis < STRING_COUNT; vis++) {
            const sIdx = (STRING_COUNT - 1) - vis
            const ext = perString[sIdx]
            const y = stringY(sIdx)
            rows.push({
              left: fretX(ext.minFret) - padX,
              right: fretX(ext.maxFret) + padX,
              yTop: y - halfRow,
              yBot: y + halfRow,
            })
          }

          let d = `M ${rows[0].left},${rows[0].yTop}`
          for (let i = 0; i < rows.length; i++) {
            const r = rows[i]
            d += ` H ${r.left} V ${r.yBot}`
            if (i < rows.length - 1) d += ` H ${rows[i + 1].left}`
          }
          d += ` H ${rows[rows.length - 1].right}`
          for (let i = rows.length - 1; i >= 0; i--) {
            const r = rows[i]
            d += ` H ${r.right} V ${r.yTop}`
            if (i > 0) d += ` H ${rows[i - 1].right}`
          }
          d += ' Z'

          const topExt = perString[5]
          const labelCx = (fretX(topExt.minFret) + fretX(topExt.maxFret)) / 2
          const labelY = stringY(5) - halfRow - 18
          const labelText = box.id === 0 ? 'Open' : `Box ${box.id}`
          const labelW = labelText.length * 6.6 + 18
          const labelH = 20

          return (
            <g key={`box-${box.id}`}>
              <g opacity={dimmed ? 0.18 : 1}>
                <path
                  d={d}
                  fill={isActive ? color : 'none'}
                  fillOpacity={isActive ? 0.08 : 0}
                  stroke={color}
                  strokeOpacity={isActive ? 0.85 : 0.32}
                  strokeWidth={isActive ? 1.5 : 0.9}
                  strokeLinejoin="round"
                />
              </g>

              <g
                style={{ cursor: 'pointer' }}
                onClick={() => onBoxChange?.(isActive ? null : box.id)}
              >
                <rect
                  x={labelCx - labelW / 2}
                  y={labelY - labelH / 2}
                  width={labelW}
                  height={labelH}
                  fill={isActive ? color : '#1a1f2a'}
                  fillOpacity={isActive ? 0.95 : 0.85}
                  stroke={color}
                  strokeOpacity={isActive ? 1 : 0.55}
                  strokeWidth={1}
                  rx="4"
                />
                <text
                  x={labelCx}
                  y={labelY + 4}
                  textAnchor="middle"
                  fontFamily="var(--font-display)"
                  fontSize="11"
                  fontWeight={600}
                  fill={isActive ? '#0c0e12' : color}
                  style={{ pointerEvents: 'none', letterSpacing: '0.02em' }}
                >
                  {labelText}
                </text>
              </g>
            </g>
          )
        })}

        {Array.from({ length: fretCount }).map((_, i) => {
          const fret = fromFret + i
          const isSingle = SINGLE_INLAYS.has(fret)
          const isDouble = DOUBLE_INLAYS.has(fret)
          if (!isSingle && !isDouble) return null
          const cx = fretX(fret)
          if (isDouble) {
            return (
              <g key={`inlay-${fret}`}>
                <circle cx={cx} cy={stringY(4) - STRING_GAP / 2} r={4.5} fill="url(#inlay)" opacity="0.5" />
                <circle cx={cx} cy={stringY(1) + STRING_GAP / 2} r={4.5} fill="url(#inlay)" opacity="0.5" />
              </g>
            )
          }
          const midY = PAD_TOP + ((STRING_COUNT - 1) * STRING_GAP) / 2
          return (
            <circle key={`inlay-${fret}`} cx={cx} cy={midY} r={4.5} fill="url(#inlay)" opacity="0.5" />
          )
        })}

        {Array.from({ length: fretCount + 1 }).map((_, i) => {
          const x = PAD_LEFT + NUT_WIDTH + i * FRET_WIDTH
          const isNut = fromFret === 0 && i === 0
          if (isNut) {
            return (
              <rect
                key="nut"
                x={PAD_LEFT}
                y={fretboardTop}
                width={NUT_WIDTH}
                height={fretboardBottom - fretboardTop}
                fill="url(#nut)"
                rx="1"
              />
            )
          }
          return (
            <line
              key={`fret-${i}`}
              x1={x}
              y1={fretboardTop}
              x2={x}
              y2={fretboardBottom}
              stroke="#7d8595"
              strokeWidth="1.8"
              opacity="0.7"
            />
          )
        })}

        {Array.from({ length: STRING_COUNT }).map((_, visualRow) => {
          const stringIndex = (STRING_COUNT - 1) - visualRow
          const y = stringY(stringIndex)
          const thickness = 0.7 + stringIndex * 0.4
          return (
            <g key={`string-${stringIndex}`}>
              <line
                x1={PAD_LEFT}
                y1={y}
                x2={fretboardRight}
                y2={y}
                stroke="#c8cdd8"
                strokeWidth={thickness}
                opacity="0.7"
              />
              <text
                x={PAD_LEFT - 14}
                y={y + 3.5}
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontSize="10"
                fontWeight={500}
                fill="#a0a8b8"
              >
                {STRING_NAMES[visualRow]}
              </text>
            </g>
          )
        })}

        {Array.from({ length: fretCount }).map((_, i) => {
          const fret = fromFret + i
          if (fret === 0) return null
          const cx = fretX(fret)
          const isMarked = SINGLE_INLAYS.has(fret) || DOUBLE_INLAYS.has(fret)
          return (
            <text
              key={`num-${fret}`}
              x={cx}
              y={height - 10}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="10.5"
              fontWeight={isMarked ? 600 : 400}
              fill={isMarked ? '#a0a8b8' : '#5a6172'}
              style={{ fontFeatureSettings: '"tnum"' }}
            >
              {fret}
            </text>
          )
        })}

        {notes.map((n) => {
          const inBox =
            !activeWindow ||
            (n.fret >= activeWindow.from && n.fret <= activeWindow.to)
          const cx = fretX(n.fret)
          const cy = stringY(n.stringIndex)
          const r = 12.5

          const fillId = n.isRoot
            ? 'noteRoot'
            : n.isBlues
              ? 'noteBlues'
              : 'noteTone'

          const labelText =
            labelMode === 'degree'
              ? scale.degreeLabels[n.degree - 1]
              : noteName(n.pc, preferredAccidental(rootPc))

          return (
            <g
              key={`note-${n.stringIndex}-${n.fret}`}
              opacity={inBox ? 1 : 0.18}
              style={{ transition: 'opacity .2s ease' }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={`url(#${fillId})`}
                stroke="rgba(0, 0, 0, 0.5)"
                strokeWidth="0.7"
                filter="url(#noteShadow)"
              />
              <circle
                cx={cx}
                cy={cy}
                r={r - 1.2}
                fill="none"
                stroke="rgba(255, 255, 255, 0.18)"
                strokeWidth="0.6"
              />
              <text
                x={cx}
                y={cy + 3.7}
                textAnchor="middle"
                fontFamily={
                  labelMode === 'degree'
                    ? 'var(--font-mono)'
                    : 'var(--font-display)'
                }
                fontSize={labelMode === 'degree' ? '10.5' : '11'}
                fontWeight={700}
                fill="#ffffff"
                style={{
                  pointerEvents: 'none',
                  fontFeatureSettings:
                    labelMode === 'degree' ? '"tnum"' : '"kern"',
                  letterSpacing: '0.01em',
                }}
              >
                {labelText}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
