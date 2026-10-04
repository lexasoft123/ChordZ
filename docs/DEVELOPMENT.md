# Developing and releasing ChordZ

## Run and verify

Use Node.js 24 and npm. Install from the checked-in lockfile:

```sh
npm ci
npm run dev
npm test
npm run build
```

`dev` opens Electron and the Vite server. `npm run preview` serves the production browser build. The UI kit archive and fonts are installed locally, so a cloned checkout does not need the SingZ sibling repositories or a font CDN.

## Packaging

```sh
npm run dist -- --mac --arm64
npm run dist -- --mac --x64
npm run dist -- --win --x64
```

Build the Windows installer on Windows and macOS installers on macOS. `dist` rebuilds first, then invokes electron-builder with publishing disabled. Installers and unpacked apps go to `release/`. `electron:build` is an alias for `dist`.

## GitHub release

The repository is prepared for `lexasoft123/ChordZ`, following the sibling SingZ repository. Adjust the package repository links and README badges if publishing elsewhere.

1. Create the GitHub repository and configure its remote.
2. Add the five Apple secrets in [MACOS-SIGNING.md](MACOS-SIGNING.md).
3. Run **Desktop release** manually once to check the macOS arm64, macOS x64 and Windows x64 installers.
4. Set `package.json` and `package-lock.json` to the intended version, commit, then push the matching tag:

```sh
npm version patch
# npm version creates a version commit and vVERSION tag.
git push origin main --follow-tags
```

The tag must exactly match `v` plus `package.json`'s version. CI builds and verifies the installers, then attaches them to a draft release with generated notes. Publishing that draft is a separate step. A failed architecture prevents release assembly. Reruns can replace assets in a draft; they refuse to overwrite a published release.

The **Checks** workflow runs the tests and TypeScript/Vite build on Linux, macOS and Windows for pushes and pull requests. The **Desktop release** workflow packages on tags and manual dispatches. It has read-only permissions during builds and grants write access only to the job assembling the draft release.

## Screenshots

The README images show ChordZ's bundled traditional sample songs. Capture the actual app in night studio with the helper open, and in Atelier with Split and Details open. Do not include a personal library or local audio paths. Screenshots are checked into `docs/screenshots/`. The captured native window title bar is cropped out to omit macOS’s screen-capture indicator; the application content is unchanged.

## Shared release infrastructure

Packaging conventions, signing setup, entitlements, ad-hoc repair, Windows NSIS options and the family app icons are adapted/copied from SingZ. ChordZ has no SingZ AI engines or mobile app, so those release jobs/resources are omitted. ChordZ currently has no in-app updater; no updater metadata is advertised.

Release infrastructure was adapted from SingZ repository commit `ccf36e2f`.
