import { useMemo, useState } from 'react'
import { Chip } from '@singz/ui'
import type { Song } from '../lib/chordpro'
import { collectChords } from '../lib/chordpro'
import { soundingKey } from '../lib/transpose'
import ChordDiagram from './ChordDiagram'

const FONT_SCALE_STEP = 0.1
const FONT_SCALE_MIN = 0.7
const FONT_SCALE_MAX = 2.2

/*
 * The panel owns the song's properties now.
 *
 * Tempo and capo used to be editable in the toolbar and displayed here at the
 * same time — two places for one fact, and the toolbar's copy was 137px of a
 * bar that never closes. A property is edited where it is described, so the
 * editors moved in and the toolbar keeps a read-only line.
 *
 * Text size joined them for the same reason: it is a preference, not something
 * you reach for mid-song, and the keyboard already had it (⌘+ / ⌘− / ⌘0).
 */
export default function MetadataPanel({
  song,
  onTagsChange,
  onArtistChange,
  onTempoChange,
  onCapoChange,
  fontScale,
  onFontScaleChange,
}: {
  song: Song
  onTagsChange: (tags: string[]) => void
  onArtistChange: (artist: string) => void
  onTempoChange: (bpm: number) => void
  onCapoChange: (capo: number) => void
  fontScale: number
  onFontScaleChange: (n: number) => void
}) {
  const [tagDraft, setTagDraft] = useState('')
  const chords = useMemo(() => collectChords(song), [song])
  const capo = song.meta.capo ?? 0
  const sounding = soundingKey(song.meta.key, capo)

  return (
    <aside className="meta">
      <Section title="Details">
        <Field label="Artist">
          <input
            className="meta-input"
            value={song.meta.artist ?? ''}
            placeholder="Artist"
            onChange={(e) => onArtistChange(e.target.value)}
          />
        </Field>
        <Field label="Key (shape)">
          <span className="meta-value">{song.meta.key ?? '—'}</span>
        </Field>
        {capo ? (
          <Field label="Sounding">
            <span className="meta-value">{sounding ?? '—'}</span>
          </Field>
        ) : null}
        <Field label="Tempo">
          <span className="meta-row">
            <input
              className="meta-input meta-input-num"
              type="number"
              value={song.meta.tempo || ''}
              placeholder="—"
              min={20}
              max={300}
              aria-label="Tempo in beats per minute"
              onChange={(e) => onTempoChange(parseInt(e.target.value, 10) || 0)}
            />
            <span className="meta-unit">BPM</span>
          </span>
        </Field>
        <Field label="Capo">
          <span className="meta-row">
            <Chip
              onClick={() => onCapoChange(Math.max(0, capo - 1))}
              disabled={capo <= 0}
              aria-label="Lower capo"
            >
              −
            </Chip>
            <span className="meta-value meta-value-num">{capo === 0 ? 'Off' : `Fret ${capo}`}</span>
            <Chip
              onClick={() => onCapoChange(Math.min(12, capo + 1))}
              disabled={capo >= 12}
              aria-label="Raise capo"
            >
              +
            </Chip>
          </span>
        </Field>
      </Section>

      <Section title="View">
        <Field label="Text size">
          <span className="meta-row">
            <Chip
              onClick={() => onFontScaleChange(Math.max(FONT_SCALE_MIN, fontScale - FONT_SCALE_STEP))}
              disabled={fontScale <= FONT_SCALE_MIN + 0.001}
              aria-label="Decrease text size"
              title="Decrease text size (⌘−)"
            >
              <span className="control-a-small">A</span>
            </Chip>
            <button
              type="button"
              className="meta-value meta-value-num meta-value-reset"
              onClick={() => onFontScaleChange(1)}
              aria-label="Reset text size"
              title="Reset to 100% (⌘0)"
            >
              {Math.round(fontScale * 100)}%
            </button>
            <Chip
              onClick={() => onFontScaleChange(Math.min(FONT_SCALE_MAX, fontScale + FONT_SCALE_STEP))}
              disabled={fontScale >= FONT_SCALE_MAX - 0.001}
              aria-label="Increase text size"
              title="Increase text size (⌘+)"
            >
              <span className="control-a-large">A</span>
            </Chip>
          </span>
        </Field>
      </Section>

      <Section title="Tags">
        <div className="meta-tags">
          {(song.meta.tags ?? []).map((t) => (
            <span className="meta-tag" key={t}>
              {t}
              <button
                className="meta-tag-remove"
                onClick={() => onTagsChange((song.meta.tags ?? []).filter((x) => x !== t))}
                aria-label={`Remove tag ${t}`}
              >×</button>
            </span>
          ))}
        </div>
        <form
          className="meta-tag-add"
          onSubmit={(e) => {
            e.preventDefault()
            const t = tagDraft.trim()
            if (!t) return
            const next = [...(song.meta.tags ?? [])]
            if (!next.includes(t)) next.push(t)
            onTagsChange(next)
            setTagDraft('')
          }}
        >
          <input
            className="meta-input"
            value={tagDraft}
            placeholder="add tag…"
            aria-label="Add a tag"
            onChange={(e) => setTagDraft(e.target.value)}
          />
        </form>
      </Section>

      <Section title="Chords used">
        <div className="meta-chord-grid">
          {chords.length === 0 && <div className="meta-empty">none yet</div>}
          {chords.map((c) => (
            <ChordDiagram key={c} chord={c} size="sm" />
          ))}
        </div>
      </Section>
    </aside>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="meta-section">
      <h3 className="eyebrow meta-section-title">{title}</h3>
      <div className="meta-section-body">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="meta-field">
      <span className="meta-field-label">{label}</span>
      <span className="meta-field-value">{children}</span>
    </div>
  )
}
