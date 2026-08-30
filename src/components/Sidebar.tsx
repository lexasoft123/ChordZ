import { useMemo, useState } from 'react'
import { Badge, Button, Modal, ModalActions } from '@singz/ui'
import type { Song } from '../lib/chordpro'

interface Props {
  songs: Song[]
  selectedId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export default function Sidebar({ songs, selectedId, onSelect, onNew, onDelete }: Props) {
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Song | null>(null)

  const grouped = useMemo(() => {
    const byTag = new Map<string, Song[]>()
    for (const s of songs) {
      const q = query.trim().toLowerCase()
      if (q) {
        const hay = (s.meta.title + ' ' + (s.meta.artist || '') + ' ' + (s.meta.tags || []).join(' ')).toLowerCase()
        if (!hay.includes(q)) continue
      }
      const tag = s.meta.tags?.[0] || 'Untagged'
      if (!byTag.has(tag)) byTag.set(tag, [])
      byTag.get(tag)!.push(s)
    }
    return [...byTag.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [songs, query])

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <span className="eyebrow">Library</span>
        <Button icon onClick={onNew} title="New song" aria-label="New song">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </Button>
      </div>
      <div className="sidebar-search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          spellCheck={false}
        />
      </div>
      <nav className="sidebar-list">
        {grouped.length === 0 && <div className="sidebar-empty">no matches</div>}
        {grouped.map(([tag, list]) => (
          <div className="sidebar-group" key={tag}>
            <div className="eyebrow sidebar-group-label">{tag}</div>
            <ul>
              {list.map((s) => (
                <li
                  key={s.id}
                  className="sidebar-item"
                  data-active={s.id === selectedId ? '1' : '0'}
                  onClick={() => onSelect(s.id)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setPendingDelete(s)
                  }}
                >
                  <span className="sidebar-item-title">{s.meta.title}</span>
                  <span className="sidebar-item-meta">
                    {/* caps={false} because "Am" set as "AM" is a different
                        chord — A minor becomes A major. */}
                    {s.meta.key && (
                      <Badge caps={false} className="sidebar-item-key">
                        {s.meta.key}
                      </Badge>
                    )}
                    {s.meta.tempo && <span className="sidebar-item-bpm">{s.meta.tempo}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">
        {songs.length} song{songs.length === 1 ? '' : 's'}
      </div>

      {pendingDelete && (
        <Modal onClose={() => setPendingDelete(null)} aria-label="Delete song">
          <h2 className="modal-title">Delete this song?</h2>
          <p className="modal-body">
            “{pendingDelete.meta.title}” will be removed from the library. This cannot
            be undone.
          </p>
          <ModalActions>
            {/* `danger` alongside the default ghost, not variant="danger":
                the kit's .pill.danger sets border-COLOR only and rides on the
                border .ghost draws, so on its own it would have none. */}
            <Button
              className="danger"
              onClick={() => {
                onDelete(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              Delete
            </Button>
            <Button onClick={() => setPendingDelete(null)}>Keep</Button>
          </ModalActions>
        </Modal>
      )}
    </aside>
  )
}
