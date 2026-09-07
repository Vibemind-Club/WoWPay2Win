#!/usr/bin/env bash
# Build the SPA and ship it to https://stykasheets.com/boemarket/
#
#   ./publish.sh              build + ship + verify
#   SKIP_BUILD=1 ./publish.sh ship the existing dist/web
#   DRY_RUN=1 ./publish.sh    build, then only print what would be copied
#
# What this touches on the box: $TARGET/index.html, the hashed main.<hash>.js /
# .css (+ .map) and the static images the build copies from src/web/static.
# What it NEVER touches: $TARGET/.htaccess (ships from the stykasheets repo via
# its deploy.sh, mapped as boemarket/*) and $TARGET/data/ (written every 30
# minutes by loothelper/cron_boemarket.php). Old hashed bundles that the new
# index.html no longer references are pruned after the swap.
#
# Order matters for a no-downtime swap: the new hashed bundle lands first,
# index.html (the only pointer at it) last, so a visitor mid-publish gets
# either the complete old site or the complete new one.
set -euo pipefail

BOX="${SLE_BOX:-evan@136.113.175.22}"
KEY="${SLE_KEY:-$HOME/.ssh/id_ed25519}"
TARGET="/var/www/stykasheets/boemarket"
URL="https://stykasheets.com/boemarket/"

# MSYS/Git-Bash mangles absolute remote paths into Windows paths.
export MSYS_NO_PATHCONV=1

cd "$(dirname "${BASH_SOURCE[0]}")"
say() { printf '%s\n' "$*"; }
die() { printf 'publish.sh: %s\n' "$*" >&2; exit 1; }
remote() { ssh -i "$KEY" -o BatchMode=yes "$BOX" "$@"; }

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  say "building (NODE_ENV=production) ..."
  # Not `pnpm build`: that script sets NODE_ENV inline, which cmd.exe cannot do
  # when pnpm runs it on Windows. Same webpack invocation, env set by this shell.
  NODE_ENV=production pnpm exec webpack --config build/webpack.config.web.ts
fi
[ -f dist/web/index.html ] || die "dist/web/index.html missing - build first"

# Everything the build emitted, index.html last.
mapfile -t files < <(cd dist/web && find . -maxdepth 1 -type f ! -name index.html | sed 's#^\./##' | sort)
say "publish plan -> $BOX:$TARGET"
for f in "${files[@]}" index.html; do say "  $f"; done
bundle="$(grep -oE 'main\.[0-9a-f]+\.js' dist/web/index.html | head -1)"
[ -n "$bundle" ] || die "index.html does not reference a main.<hash>.js bundle"

if [ "${DRY_RUN:-0}" = "1" ]; then
  say "DRY_RUN=1: nothing copied."
  exit 0
fi

remote "mkdir -p '$TARGET/data'"
for f in "${files[@]}"; do
  scp -q -i "$KEY" "dist/web/$f" "$BOX:$TARGET/$f"
done
scp -q -i "$KEY" dist/web/index.html "$BOX:$TARGET/index.html.publishtmp"
remote "mv '$TARGET/index.html.publishtmp' '$TARGET/index.html'"

# Prune hashed files the new build no longer references. The keep-list is every
# <name>.<contenthash>.js/.css named by index.html OR by the entry bundle (the
# lazy chunks - 878.<hash>.js and friends - are referenced from main.<hash>.js,
# not from the HTML). .htaccess, the images and data/ are never touched.
remote "cd '$TARGET' && keep=\"\$(cat index.html '$bundle' | grep -oE '[0-9A-Za-z_-]+\.[0-9a-f]{16,}\.(js|css)' | sort -u)\"
for old in *.[0-9a-f]*.js *.[0-9a-f]*.css *.[0-9a-f]*.js.map *.[0-9a-f]*.css.map *.[0-9a-f]*.js.LICENSE.txt; do
  [ -e \"\$old\" ] || continue
  base=\"\$(printf '%s' \"\$old\" | sed -E 's/\.(map|LICENSE\.txt)$//')\"
  printf '%s\n' \"\$keep\" | grep -qx \"\$base\" || { rm -f \"\$old\"; echo \"  pruned \$old\"; }
done"

say "verifying $URL ..."
live="$(curl -s -m 20 "$URL")"
printf '%s' "$live" | grep -q "$bundle" || die "live index.html does not reference $bundle"
code="$(curl -s -m 20 -o /dev/null -w '%{http_code}' "$URL$bundle")"
[ "$code" = "200" ] || die "bundle $bundle answered http $code"
say "published: $URL serves $bundle"
