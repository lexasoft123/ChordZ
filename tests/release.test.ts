import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version
const root = new URL('../', import.meta.url)

test('release tags must match the packaged version', () => {
  for (const [tag, valid] of [[`v${version}`, true], ['v999.0.0', false], [version, false]] as const) {
    const result = spawnSync(process.execPath, ['scripts/check-release-version.cjs'], {
      cwd: root, env: { ...process.env, RELEASE_TAG: tag }, encoding: 'utf8',
    })
    assert.equal(result.status === 0, valid)
  }
})

function signing(extra: Record<string, string>) {
  const env = { ...process.env }
  for (const name of Object.keys(env)) {
    if (/^(APPLE_|APP_STORE_CONNECT_|CHORDZ_REQUIRE_SIGNING)/.test(name)) delete env[name]
  }
  return spawnSync('bash', ['scripts/setup-macos-signing.sh'], {
    cwd: root, env: { ...env, ...extra }, encoding: 'utf8',
  })
}

test('manual packaging allows no credentials without exporting signing variables', { skip: process.platform === 'win32' }, () => {
  const result = signing({ CHORDZ_REQUIRE_SIGNING: 'false' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /ad-hoc signed, not notarized/)
})

test('tagged macOS releases refuse absent credentials', { skip: process.platform === 'win32' }, () => {
  const result = signing({ CHORDZ_REQUIRE_SIGNING: 'true' })
  assert.notEqual(result.status, 0)
  assert.match(result.stdout, /All five/)
})

test('partial Apple credentials fail before creating a keychain', { skip: process.platform === 'win32' }, () => {
  const result = signing({ APP_STORE_CONNECT_API_KEY_ID: 'test-id' })
  assert.notEqual(result.status, 0)
  assert.match(result.stdout, /All five/)
})
