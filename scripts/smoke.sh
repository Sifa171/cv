#!/usr/bin/env bash
# Rauchprobe nach einem Deploy (Spec 5.4). Aufruf: scripts/smoke.sh <base-url> [--prod]
set -uo pipefail
BASE="${1:?Basis-URL fehlt}"
PROD="${2:-}"
FAIL=0

check() {
  if [ "$2" = "1" ]; then echo "ok     $1"; else echo "FEHLER $1"; FAIL=1; fi
}

head_of() { curl -s -o /dev/null -D - "$@"; }
status_of() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
has() { grep -qi "$1" <<<"$2" && echo 1; }

h=$(head_of -H 'Accept-Language: de-DE,de;q=0.9' "$BASE/")
check "/ (de) → 302 /de/" "$( [ "$(has '^HTTP.* 302' "$h")" = 1 ] && has '^location: /de/' "$h")"
h=$(head_of -H 'Accept-Language: en-US' "$BASE/")
check "/ (en) → 302 /en/" "$(has '^location: /en/' "$h")"

for lang in de en; do
  h=$(head_of "$BASE/$lang/")
  check "/$lang/ 200" "$(has '^HTTP.* 200' "$h")"
  check "/$lang/ CSP" "$(has '^content-security-policy:' "$h")"
  check "/$lang/ HSTS" "$(has '^strict-transport-security:' "$h")"
  check "/$lang/ no-cache" "$(has '^cache-control: no-cache' "$h")"
  h=$(head_of "$BASE/cv/sebastian-dehn-cv-$lang.pdf")
  check "PDF $lang" "$( [ "$(has '^HTTP.* 200' "$h")" = 1 ] && has '^content-type: application/pdf' "$h")"
done

js=$(curl -s "$BASE/de/" | grep -o '/_astro/[^"]*\.js' | head -1)
h=$(head_of "$BASE$js")
check "Assets immutable ($js)" "$( [ -n "$js" ] && has '^cache-control: public, max-age=31536000, immutable' "$h")"

check "404 für Unbekanntes" "$( [ "$(status_of "$BASE/gibt-es-nicht/")" = "404" ] && echo 1)"

if [ "$PROD" = "--prod" ]; then
  h=$(head_of "http://sifa-web.com/")
  check "http → https" "$( [ "$(has '^HTTP.* 30[18]' "$h")" = 1 ] && has '^location: https://sifa-web.com/' "$h")"
  h=$(head_of "https://www.sifa-web.com/x?y=1")
  check "www → Hauptdomain" "$( [ "$(has '^HTTP.* 301' "$h")" = 1 ] && has '^location: https://sifa-web.com/x?y=1' "$h")"
  check "status.sifa-web.com weiter 302" "$( [ "$(status_of https://status.sifa-web.com/)" = "302" ] && echo 1)"
fi

exit $FAIL
