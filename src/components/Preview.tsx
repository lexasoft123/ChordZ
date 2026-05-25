import { useMemo } from 'react'
import type { Section, Song, Segment } from '../lib/chordpro'
import ChordToken from './ChordToken'

const SECTION_LABEL: Record<Section['kind'], string> = {
  verse: 'Verse',
  chorus: 'Chorus',
  bridge: 'Bridge',
  intro: 'Intro',
  outro: 'Outro',
  tab: 'Tab',
}

export default function Preview({ song, themeKey }: { song: Song; themeKey: 'atelier' | 'studio' }) {
  const verseNumbers = useMemo(() => numberVerses(song.sections), [song.sections])
  return (
    <article className="preview" data-theme={themeKey}>
      <div className="preview-page">
        {song.sections.map((sec, si) => (
          <SectionBlock
            key={si}
            section={sec}
            verseNumber={verseNumbers[si]}
          />
        ))}
        {song.sections.length === 0 && (
          <div className="preview-empty">
            This song has no content yet. Switch to Edit mode to write some lyrics.
          </div>
        )}
      </div>
    </article>
  )
}

function numberVerses(sections: Section[]): (number | undefined)[] {
  let n = 0
  return sections.map((s) => (s.kind === 'verse' ? ++n : undefined))
}

function SectionBlock({ section, verseNumber }: { section: Section; verseNumber?: number }) {
  return (
    <section className={`preview-section preview-section-${section.kind}`}>
      <div className="preview-section-head">
        <span className="preview-section-tag">
          {SECTION_LABEL[section.kind]}
          {verseNumber !== undefined ? ` ${verseNumber}` : ''}
        </span>
        {section.label && (
          <span className="preview-section-label">{section.label}</span>
        )}
      </div>
      <div className="preview-section-body">
        {section.lines.map((ln, li) => (
          <LineRow key={li} segments={ln.segments} />
        ))}
      </div>
    </section>
  )
}

function LineRow({ segments }: { segments: Segment[] }) {
  // Render two synchronized rows: chords above, lyrics below.
  // We split the line into "cells" where each cell is one chord+text pair
  // (or just text). The cells share a baseline column-by-column.
  const cells: { chord?: string; text: string }[] = []
  let buffer: { chord?: string; text: string } | null = null

  for (const seg of segments) {
    if (seg.type === 'chord') {
      if (buffer) cells.push(buffer)
      buffer = { chord: seg.chord, text: seg.text }
    } else {
      if (buffer) {
        buffer.text += seg.text
      } else {
        buffer = { text: seg.text }
      }
    }
  }
  if (buffer) cells.push(buffer)

  if (cells.length === 0) return <div className="preview-line preview-line-blank" />

  return (
    <div className="preview-line">
      {cells.map((cell, i) => (
        <span className="preview-cell" key={i}>
          <span className="preview-cell-chord">
            {cell.chord ? <ChordToken chord={cell.chord} /> : ' '}
          </span>
          <span className="preview-cell-lyric">
            {cell.text.length > 0 ? cell.text : ' '}
          </span>
        </span>
      ))}
    </div>
  )
}
