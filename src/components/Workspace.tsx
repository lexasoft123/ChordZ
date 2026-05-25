import { useState } from 'react'
import type { Song } from '../lib/chordpro'
import { serializeChordPro } from '../lib/chordpro'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import Preview from './Preview'
import Editor from './Editor'
import MetadataPanel from './MetadataPanel'
import Player from './Player'
import PerformanceOverlay from './PerformanceOverlay'

export type Mode = 'preview' | 'edit' | 'split'

export interface WorkspaceProps {
  themeKey: 'atelier' | 'studio'
  songs: Song[]
  selectedSong: Song | null
  displaySong: Song | null
  transpose: number
  onTransposeChange: (n: number) => void
  onSelectSong: (id: string) => void
  onUpdateSong: (s: Song) => void
  onUpdateSongSource: (id: string, source: string) => void
  onNewSong: () => void
  onDeleteSong: (id: string) => void
  preferFlats: boolean
  onPreferFlatsChange: (v: boolean) => void
  dark: boolean
  onDarkChange: (v: boolean) => void
  fontScale: number
  onFontScaleChange: (n: number) => void
  /** When true, hide sidebar + metadata so the pane shows only the song surface. Used by Compare. */
  compact?: boolean
}

export default function Workspace(props: WorkspaceProps) {
  const [mode, setMode] = useState<Mode>('preview')
  const [performance, setPerformance] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(20) // px/sec
  const [metaOpen, setMetaOpen] = useState(!props.compact)

  const { selectedSong, displaySong } = props

  return (
    <div
      className={`workspace theme-${props.themeKey}`}
      data-compact={props.compact ? '1' : '0'}
      data-dark={props.dark ? '1' : '0'}
      style={{ ['--font-scale' as string]: props.fontScale }}
    >
      {!props.compact && (
        <Sidebar
          songs={props.songs}
          selectedId={selectedSong?.id ?? null}
          onSelect={props.onSelectSong}
          onNew={props.onNewSong}
          onDelete={props.onDeleteSong}
          themeKey={props.themeKey}
        />
      )}
      <main className="workspace-main">
        {displaySong ? (
          <>
            <Toolbar
              song={displaySong}
              mode={mode}
              onModeChange={setMode}
              transpose={props.transpose}
              onTransposeChange={props.onTransposeChange}
              preferFlats={props.preferFlats}
              onPreferFlatsChange={props.onPreferFlatsChange}
              metaOpen={metaOpen}
              onMetaToggle={() => setMetaOpen((v) => !v)}
              onPerform={() => setPerformance(true)}
              onCapoChange={(capo) => {
                if (!selectedSong) return
                props.onUpdateSong({
                  ...selectedSong,
                  meta: { ...selectedSong.meta, capo },
                })
              }}
              onTempoChange={(tempo) => {
                if (!selectedSong) return
                props.onUpdateSong({
                  ...selectedSong,
                  meta: { ...selectedSong.meta, tempo },
                })
              }}
              fontScale={props.fontScale}
              onFontScaleChange={props.onFontScaleChange}
              themeKey={props.themeKey}
            />
            <div className={`workspace-body mode-${mode}`}>
              {(mode === 'preview' || mode === 'split') && (
                <Preview song={displaySong} themeKey={props.themeKey} />
              )}
              {(mode === 'edit' || mode === 'split') && selectedSong && (
                <Editor
                  source={serializeChordPro(selectedSong)}
                  onChange={(src) => props.onUpdateSongSource(selectedSong.id, src)}
                  themeKey={props.themeKey}
                />
              )}
              {metaOpen && !props.compact && (
                <MetadataPanel
                  song={displaySong}
                  themeKey={props.themeKey}
                  onTagsChange={(tags) => {
                    if (!selectedSong) return
                    props.onUpdateSong({
                      ...selectedSong,
                      meta: { ...selectedSong.meta, tags },
                    })
                  }}
                  onArtistChange={(artist) => {
                    if (!selectedSong) return
                    props.onUpdateSong({
                      ...selectedSong,
                      meta: { ...selectedSong.meta, artist },
                    })
                  }}
                />
              )}
            </div>
            <Player song={displaySong} themeKey={props.themeKey} />
            {performance && (
              <PerformanceOverlay
                song={displaySong}
                onClose={() => setPerformance(false)}
                scrollSpeed={scrollSpeed}
                onScrollSpeedChange={setScrollSpeed}
                themeKey={props.themeKey}
              />
            )}
          </>
        ) : (
          <div className="workspace-empty">
            <div className="workspace-empty-inner">
              <div className="workspace-empty-mark">∅</div>
              <div className="workspace-empty-title">No song selected</div>
              <button className="workspace-empty-btn" onClick={props.onNewSong}>
                New song
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
