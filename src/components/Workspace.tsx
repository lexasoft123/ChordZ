import { useState } from 'react'
import { Button } from '@singz/ui'
import type { Song } from '../lib/chordpro'
import { serializeChordPro } from '../lib/chordpro'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import Preview from './Preview'
import Editor from './Editor'
import MetadataPanel from './MetadataPanel'
import Player from './Player'
import PerformanceOverlay from './PerformanceOverlay'
import GuitarHelper from './GuitarHelper'
import { rootToPitchClass, type PitchClass } from '../lib/scales'

export type Mode = 'preview' | 'edit' | 'split'

export interface WorkspaceProps {
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
  fontScale: number
  onFontScaleChange: (n: number) => void
  showHelper: boolean
  onShowHelperChange: (v: boolean) => void
}

function songRootPc(song: { meta: { key?: string } } | null): PitchClass | undefined {
  if (!song?.meta.key) return undefined
  const raw = song.meta.key.trim()
  const match = raw.match(/^([A-G])([#b]?)/)
  if (!match) return undefined
  const note = match[1] + (match[2] || '')
  try {
    return rootToPitchClass(note)
  } catch {
    return undefined
  }
}

export default function Workspace(props: WorkspaceProps) {
  const [mode, setMode] = useState<Mode>('preview')
  const [performance, setPerformance] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(20) // px/sec
  const [metaOpen, setMetaOpen] = useState(true)

  const { selectedSong, displaySong } = props

  return (
    <div
      className="workspace"
      style={{ ['--font-scale' as string]: props.fontScale }}
    >
      <Sidebar
        songs={props.songs}
        selectedId={selectedSong?.id ?? null}
        onSelect={props.onSelectSong}
        onNew={props.onNewSong}
        onDelete={props.onDeleteSong}
      />
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
              showHelper={props.showHelper}
              onShowHelperChange={props.onShowHelperChange}
            />
            <div className={`workspace-body mode-${mode}`}>
              {(mode === 'preview' || mode === 'split') && <Preview song={displaySong} />}
              {(mode === 'edit' || mode === 'split') && selectedSong && (
                <Editor
                  source={serializeChordPro(selectedSong)}
                  onChange={(src) => props.onUpdateSongSource(selectedSong.id, src)}
                />
              )}
              {metaOpen && (
                <MetadataPanel
                  song={displaySong}
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
            {props.showHelper && (
              <GuitarHelper
                key={selectedSong?.id ?? 'no-song'}
                song={displaySong}
                initialRoot={songRootPc(displaySong)}
                initialScale={
                  displaySong?.meta.key && /m\b|minor/i.test(displaySong.meta.key)
                    ? 'minor'
                    : 'major'
                }
                onClose={() => props.onShowHelperChange(false)}
              />
            )}
            <Player
              song={displaySong}
              showHelper={props.showHelper}
              onShowHelperChange={props.onShowHelperChange}
            />
            {performance && (
              <PerformanceOverlay
                song={displaySong}
                onClose={() => setPerformance(false)}
                scrollSpeed={scrollSpeed}
                onScrollSpeedChange={setScrollSpeed}
              />
            )}
          </>
        ) : (
          <div className="workspace-empty">
            <div className="workspace-empty-inner">
              <div className="workspace-empty-mark">♪</div>
              <div className="workspace-empty-title">No song selected</div>
              <Button variant="primary" onClick={props.onNewSong}>
                New song
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
