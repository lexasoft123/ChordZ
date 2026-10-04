import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decodeLibrary, encodeLibrary } from '../src/lib/library.ts'
import { parseChordPro } from '../src/lib/chordpro.ts'

test('preserves song identity and selection across saves and deletes', () => {
  const songs = [parseChordPro('{title: First}', 'first'), parseChordPro('{title: Second}', 'second')]
  const restored = decodeLibrary(encodeLibrary({ songs, selectedId: 'second' }))
  assert.equal(restored.selectedId, 'second')
  assert.deepEqual(restored.songs.map((s) => s.id), ['first', 'second'])
  const afterDelete = decodeLibrary(encodeLibrary({ songs: restored.songs.slice(1), selectedId: 'second' }))
  assert.equal(afterDelete.selectedId, 'second')
})

test('loads the old source-only format and recovers a stale selection', () => {
  const restored = decodeLibrary(JSON.stringify({ sources: ['{title: Legacy}'], selectedId: 'missing' }))
  assert.equal(restored.songs[0].meta.title, 'Legacy')
  assert.equal(restored.selectedId, restored.songs[0].id)
})

test('an intentionally empty library stays empty', () => {
  assert.deepEqual(decodeLibrary(encodeLibrary({ songs: [], selectedId: null })), { songs: [], selectedId: null })
})

test('rejects invalid data so hydration can disable saving', () => {
  for (const raw of ['', 'null', '{}', '{"sources":[42]}', '{"sources":"song"}']) {
    assert.throws(() => decodeLibrary(raw))
  }
})

test('duplicate stored identifiers become distinct', () => {
  const restored = decodeLibrary(JSON.stringify({ sources: ['', ''], ids: ['same', 'same'] }))
  assert.equal(new Set(restored.songs.map((s) => s.id)).size, 2)
})
