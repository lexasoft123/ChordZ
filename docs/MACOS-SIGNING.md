# Signing and notarizing ChordZ on macOS

Adapted from SingZ's `docs/MACOS-SIGNING.md`, `build.yml`, entitlements and packaging hook. Both apps pin electron-builder 26.15.3. ChordZ uses its own bundle identifier, `studio.chordz.app`, and installers are named `ChordZ-VERSION-OS-ARCH`.

## GitHub Actions secrets

Set these in the **ChordZ repository**, under Settings → Secrets and variables → Actions. Use the same existing SingZ credentials; a Developer ID certificate and an App Store Connect team API key can sign/notarize multiple apps belonging to that team.

| Secret | Value |
| --- | --- |
| `APPLE_DEVELOPER_ID_CERTIFICATE_BASE64` | Base64 of the Developer ID Application `.p12`, including its private key |
| `APPLE_DEVELOPER_ID_CERTIFICATE_PASSWORD` | The `.p12` export password |
| `APP_STORE_CONNECT_API_KEY_BASE64` | Base64 of the App Store Connect `.p8` private key |
| `APP_STORE_CONNECT_API_KEY_ID` | That API key's ID |
| `APP_STORE_CONNECT_API_ISSUER_ID` | That API key's issuer ID |

Repository secrets do not transfer with copied workflow files, and GitHub does not let clients read secret values back. Set them from the original certificate/key exports, or grant ChordZ access to equivalent organization secrets. Do not commit credentials. The key must belong to the Developer ID certificate's active Apple team and have permission to submit notarization requests.

The API-key authentication path does not require `APPLE_TEAM_ID`; the issuer identifies the team. No Apple account password or provisioning profile is needed. An iOS Apple Development/Distribution certificate is not a substitute for a **Developer ID Application** certificate.

## Pipeline

1. `scripts/setup-macos-signing.sh` imports the certificate into an isolated temporary keychain and validates its Developer ID identity.
2. The script sets `CSC_KEYCHAIN` and `CSC_NAME`. It decodes the `.p8` to a mode-600 file and sets `APPLE_API_KEY` to that **path**, plus `APPLE_API_KEY_ID` and `APPLE_API_ISSUER`.
3. `scripts/afterPack.cjs` repairs the repacked Electron bundle's signature with an ad-hoc pass. electron-builder then replaces that with Developer ID signing, using Hardened Runtime and the supplied entitlements, and submits the app to Apple.
4. CI verifies the app signature, Gatekeeper assessment and stapled app ticket. It staples and validates the DMG ticket, then uploads the installer.
5. An `always()` cleanup step deletes the temporary keychain, certificate and API-key files.

**Do not replace this with `CSC_LINK`.** In electron-builder 26.15.3, its certificate import passes the `.p12` password to `security set-key-partition-list`, which expects the temporary keychain password. The manual import uses the correct password.

The signing options are flat siblings under `mac:` in `electron-builder.yml`. In this version, `mac.sign` accepts a custom signing function, not a nested configuration object.

ChordZ copies SingZ's V8/JIT entitlements but does not request microphone access: it plays backing audio and does not record it.

## Release versus development builds

A `v*` tag requires all five secrets. Partial credentials fail early. A manual workflow run with no secrets builds ad-hoc macOS installers for testing and produces workflow artifacts; it does not create a release. Credentials configured on a manual run produce signed/notarized artifacts.

Local `npm run dist -- --mac --arm64` auto-discovers a Developer ID certificate in the local keychain. Without credentials it creates an ad-hoc build. That is not an Apple-notarized release. For local notarization, set `APPLE_API_KEY` to the `.p8` path, `APPLE_API_KEY_ID` and `APPLE_API_ISSUER` before packaging.

Tag releases are assembled into a **draft GitHub Release** after all three installer jobs succeed. Review the release and publish it in GitHub. Windows installers are unsigned until a separate Windows signing configuration is added.
