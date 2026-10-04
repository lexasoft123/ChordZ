// Dependencies are bundled by Vite, so retain their notices without shipping
// duplicate runtime packages, development builds, or font source files.
const { readFileSync, writeFileSync } = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const packages = [
  'react', 'react-dom', 'scheduler',
  '@fontsource-variable/bricolage-grotesque',
  '@fontsource-variable/martian-mono',
]
const notices = packages.map(name => {
  const directory = path.join(root, 'node_modules', name)
  const metadata = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8'))
  return `${name} ${metadata.version}\n\n${readFileSync(path.join(directory, 'LICENSE'), 'utf8')}`
})
const kit = JSON.parse(readFileSync(path.join(root, 'node_modules/@singz/ui/package.json'), 'utf8'))
notices.push(`@singz/ui ${kit.version}\nLicense declared by upstream: ${kit.license}.\nThe upstream archive does not include a LICENSE file.`)
writeFileSync(path.join(root, 'dist/third-party-notices.txt'), notices.join('\n\n---\n\n'))
