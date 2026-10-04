import { Button } from '@singz/ui'
import { useMemo, useState } from 'react'
import type { Song } from '../lib/chordpro'

interface Props {
  songs: Song[]
  selectedId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  themeKey: 'atelier' | 'studio'
}

export default function Sidebar({ songs, selectedId, onSelect, onNew, onDelete, themeKey }: Props) {
  const [query, setQuery] = useState('')

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
        <span className="sidebar-head-label">Library</span>
        <Button size="sm" className="sidebar-new" onClick={onNew} title="New song" aria-label="New song">
          +
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
        {grouped.length === 0 && (
          <div className="sidebar-empty">no matches</div>
        )}
        {grouped.map(([tag, list]) => (
          <div className="sidebar-group" key={tag}>
            <div className="sidebar-group-label">{tag}</div>
            <ul>
              {list.map((s) => (
                <li
                  key={s.id}
                  className="sidebar-item"
                  data-active={s.id === selectedId ? '1' : '0'}
                  onClick={() => onSelect(s.id)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    if (confirm(`Delete "${s.meta.title}"?`)) onDelete(s.id)
                  }}
                >
                  <span className="sidebar-item-title">{s.meta.title}</span>
                  <span className="sidebar-item-meta">
                    {s.meta.key && <span className="sidebar-item-key">{s.meta.key}</span>}
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
    </aside>
  )
}
