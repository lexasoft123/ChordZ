// SingZ's build-then-package convention, without its native engine pipeline.
const { spawnSync } = require('node:child_process')
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { shell: process.platform === 'win32' })
// Publishing belongs to the release workflow, never to local packaging.
run(process.execPath, [require.resolve('electron-builder/cli.js'), ...process.argv.slice(2), '--publish', 'never'])
