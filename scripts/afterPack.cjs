// Adapted from SingZ: repair Electron's invalidated upstream signature before
// electron-builder performs its Developer ID signing and notarization pass.
const { execFileSync } = require('node:child_process')
const path = require('node:path')
module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return
  const app = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`)
  execFileSync('/usr/bin/codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' })
  execFileSync('/usr/bin/codesign', ['--verify', '--deep', '--strict', app], { stdio: 'inherit' })
}
