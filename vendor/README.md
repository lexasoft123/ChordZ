# SingZ UI dependency

`singz-ui-1.8.2.tgz` was produced with `npm pack` from `../singz-ui` (package version 1.8.2, repository HEAD `45b4a97ed034712ed4257dd0ccaeab842fb4e260`). The archive contains that checkout's built `dist` files, package metadata and README. Upstream declares MIT in its package metadata; no standalone LICENSE file was present in the supplied checkout.

Upstream: https://github.com/lexasoft123/singz-ui

To update, build and verify the sibling kit first, then run from ChordZ:

```sh
npm pack ../singz-ui --pack-destination vendor --ignore-scripts
npm install ./vendor/singz-ui-VERSION.tgz
npm run build
```

Commit the new archive, package.json and package-lock.json together, and update this provenance note. Remove the superseded archive once the dependency has moved.
