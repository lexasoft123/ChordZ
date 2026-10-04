#!/usr/bin/env bash
# Adapted from SingZ's build.yml. Never use CSC_LINK with builder 26.15.3:
# its import path confuses the P12 password with the temporary keychain password.
set -euo pipefail
required=(APPLE_DEVELOPER_ID_CERTIFICATE_BASE64 APPLE_DEVELOPER_ID_CERTIFICATE_PASSWORD APP_STORE_CONNECT_API_KEY_BASE64 APP_STORE_CONNECT_API_KEY_ID APP_STORE_CONNECT_API_ISSUER_ID)
configured=0
for name in "${required[@]}"; do
  if [[ -n "${!name:-}" ]]; then configured=$((configured + 1)); fi
done
if [[ "$configured" == 0 && "${CHORDZ_REQUIRE_SIGNING:-false}" != true ]]; then
  echo '::notice::Apple credentials absent; manual build will be ad-hoc signed, not notarized.'
  exit 0
fi
if [[ "$configured" != "${#required[@]}" ]]; then
  echo '::error::All five Apple signing/notarization secrets are required for a signed release.'
  exit 1
fi
: "${RUNNER_TEMP:?}" "${GITHUB_ENV:?}"
umask 077
kc="$RUNNER_TEMP/chordz-signing.keychain-db"
p12="$RUNNER_TEMP/chordz-developer-id.p12"
key="$RUNNER_TEMP/chordz-AuthKey.p8"
kcpw=$(openssl rand -base64 24)
echo "::add-mask::$kcpw"
trap 'rm -f "$p12"' EXIT
printf '%s' "$APPLE_DEVELOPER_ID_CERTIFICATE_BASE64" | base64 -d > "$p12"
printf '%s' "$APP_STORE_CONNECT_API_KEY_BASE64" | base64 -d > "$key"
security create-keychain -p "$kcpw" "$kc"
security set-keychain-settings "$kc"
security unlock-keychain -p "$kcpw" "$kc"
security import "$p12" -k "$kc" -T /usr/bin/codesign -T /usr/bin/productbuild -P "$APPLE_DEVELOPER_ID_CERTIFICATE_PASSWORD"
security set-key-partition-list -S apple-tool:,apple: -s -k "$kcpw" "$kc" >/dev/null
# Append to the search list instead of hiding the runner's login keychain.
security list-keychains -d user -s "$kc" $(security list-keychains -d user | tr -d '"')
name=$(security find-identity -v -p codesigning "$kc" | sed -n 's/.*"\(Developer ID Application: .*\)".*/\1/p' | head -1)
if [[ -z "$name" ]]; then
  echo '::error::The certificate must contain a valid Developer ID Application identity.'
  exit 1
fi
{
  printf 'CSC_KEYCHAIN=%s\n' "$kc"
  printf 'CSC_NAME=%s\n' "${name#Developer ID Application: }"
  printf 'APPLE_API_KEY=%s\n' "$key"
  printf 'APPLE_API_KEY_ID=%s\n' "$APP_STORE_CONNECT_API_KEY_ID"
  printf 'APPLE_API_ISSUER=%s\n' "$APP_STORE_CONNECT_API_ISSUER_ID"
} >> "$GITHUB_ENV"
