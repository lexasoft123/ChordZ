import { Button } from '@singz/ui'
import { useMemo, useState } from 'react'
import type { Song } from '../lib/chordpro'
import { collectChords } from '../lib/chordpro'
import { soundingKey } from '../lib/transpose'
import ChordDiagram from './ChordDiagram'

export default function MetadataPanel({
  song,
  themeKey,
  onTagsChange,
  onArtistChange,
}: {
  song: Song
  themeKey: 'atelier' | 'studio'
  onTagsChange: (tags: string[]) => void
  onArtistChange: (artist: string) => void
}) {
  const [tagDraft, setTagDraft] = useState('')
  const chords = useMemo(() => collectChords(song), [song])
  const sounding = soundingKey(song.meta.key, song.meta.capo ?? 0)

  return (
    <aside className="meta" data-theme={themeKey}>
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
        {song.meta.capo ? (
          <Field label="Sounding">
            <span className="meta-value">{sounding ?? '—'}</span>
          </Field>
        ) : null}
        <Field label="Tempo">
          <span className="meta-value">
            {song.meta.tempo ? `${song.meta.tempo} BPM` : '—'}
          </span>
        </Field>
        <Field label="Capo">
          <span className="meta-value">
            {song.meta.capo ? `Fret ${song.meta.capo}` : 'Off'}
          </span>
        </Field>
      </Section>

      <Section title="Tags">
        <div className="meta-tags">
          {(song.meta.tags ?? []).map((t) => (
            <span className="meta-tag" key={t}>
              {t}
              <Button size="sm"
                className="meta-tag-remove"
                onClick={() => onTagsChange((song.meta.tags ?? []).filter((x) => x !== t))}
                aria-label={`Remove tag ${t}`}
              >×</Button>
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
      <h3 className="meta-section-title">{title}</h3>
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
