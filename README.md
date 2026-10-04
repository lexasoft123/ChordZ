# ChordZ

A musician's notebook for writing and performing songs with chords and backing tracks. Built with React, TypeScript, Vite and Electron, using the SingZ UI kit.

## Development

Use Node.js 24 LTS (minimum 22.12) and npm.

```sh
npm ci
npm run dev
```

The development command opens the Electron app. Songs are saved in Electron's application data directory; in the browser they use local storage. Open the Vite URL to use the browser version.

```sh
npm run typecheck
npm run build
npm run preview
npm run electron:build
```

`build` generates the browser app in `dist` and Electron code in `dist-electron`. `electron:build` also packages a desktop installer using electron-builder. macOS distribution signing requires your own signing credentials. Build assets use relative URLs for packaged Electron and static hosting.

## Shared UI

ChordZ uses `@singz/ui` 1.8.2 from [singz-ui](https://github.com/lexasoft123/singz-ui). Shared buttons, chips, dialogs, segmented controls, window controls, focus styles and palette tokens come from the kit. The palette toggle switches between Atelier paper and night studio; the first launch follows the system appearance. The redesigned shell includes keyboard-accessible library actions, save/error feedback, and guitar chord diagrams. Fonts are bundled through Fontsource.

The package is checked in as `vendor/singz-ui-1.8.2.tgz`, so a fresh clone does not need `../singz-ui`, a private registry or a mutable remote branch. See [vendor/README.md](vendor/README.md) for provenance and updates. App layout and music-specific diagrams remain in `src/styles` and `src/components`.

## GitHub publishing

The repository includes a lockfile and GitHub Actions build checks. Generated output, local environment files and development tool state are ignored. No GitHub remote is configured yet.

After reviewing and committing the source, create an empty GitHub repository and push it:

```sh
 git remote add origin https://github.com/YOUR_ACCOUNT/ChordZ.git
 git push -u origin HEAD
```

Choose the repository visibility and the application's license before public distribution. The bundled UI kit declares MIT; that does not establish a license for ChordZ itself.
