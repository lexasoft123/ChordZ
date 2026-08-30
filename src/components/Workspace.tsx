import { useState } from 'react'
import { Button } from '@singz/ui'
import type { Song } from '../lib/chordpro'
import type { SaveState } from '../App'
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
  hydrating: boolean
  saveState: SaveState
  onError: (message: string) => void
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
  metaOpen: boolean
  onMetaOpenChange: (v: boolean) => void
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

  const { selectedSong, displaySong } = props

  // Every field the details panel edits goes back the same way.
  const patchMeta = (patch: Partial<Song['meta']>) => {
    if (!selectedSong) return
    props.onUpdateSong({ ...selectedSong, meta: { ...selectedSong.meta, ...patch } })
  }

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
        hydrating={props.hydrating}
        saveState={props.saveState}
      />
      <main className="workspace-main">
        {props.hydrating ? (
          <div className="workspace-empty">
            <div className="workspace-empty-inner">
              {/* A line, not a spinner: a local read settles in about 20ms and
                  a spinner for that is theatre. It is here so the app never
                  shows a song that is not yours while it waits. */}
              <div className="eyebrow">Loading library…</div>
            </div>
          </div>
        ) : displaySong ? (
          <>
            <Toolbar
              song={displaySong}
              mode={mode}
              onModeChange={setMode}
              transpose={props.transpose}
              onTransposeChange={props.onTransposeChange}
              preferFlats={props.preferFlats}
              onPreferFlatsChange={props.onPreferFlatsChange}
              metaOpen={props.metaOpen}
              onMetaToggle={() => props.onMetaOpenChange(!props.metaOpen)}
              onPerform={() => setPerformance(true)}
            />
            <div className={`workspace-body mode-${mode}`}>
              {(mode === 'preview' || mode === 'split') && <Preview song={displaySong} />}
              {(mode === 'edit' || mode === 'split') && selectedSong && (
                <Editor
                  source={serializeChordPro(selectedSong)}
                  onChange={(src) => props.onUpdateSongSource(selectedSong.id, src)}
                />
              )}
              {props.metaOpen && (
                <MetadataPanel
                  song={displaySong}
                  onTagsChange={(tags) => patchMeta({ tags })}
                  onArtistChange={(artist) => patchMeta({ artist })}
                  onTempoChange={(tempo) => patchMeta({ tempo })}
                  onCapoChange={(capo) => patchMeta({ capo })}
                  fontScale={props.fontScale}
                  onFontScaleChange={props.onFontScaleChange}
                />
              )}
            </div>
            {props.showHelper && (
              <GuitarHelper
                key={selectedSong?.id ?? 'no-song'}
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
              onError={props.onError}
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
