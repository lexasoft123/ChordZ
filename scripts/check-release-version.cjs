const { version } = require('../package.json')
if (process.env.RELEASE_TAG !== `v${version}`) {
  throw new Error(`Release tag ${process.env.RELEASE_TAG} does not match package version v${version}`)
}
