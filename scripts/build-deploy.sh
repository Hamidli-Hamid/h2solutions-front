#!/usr/bin/env bash
#
# Builds the site for production and syncs the deployable output into
# ../front-build, which is its own git repo that cPanel pulls from.
#
#   ./scripts/build-deploy.sh              # build + sync + commit + push
#   ./scripts/build-deploy.sh --no-push    # build + sync + commit, push by hand
#   ./scripts/build-deploy.sh --dry        # build + sync only, no git at all
#
# What lands in front-build/ is exactly what the server needs to run and
# nothing else: the compiled .next output, public assets, the manifests npm
# needs, a JS-compiled next.config, and server.js. node_modules stays out —
# it is installed once on cPanel with `npm ci --omit=dev`.

set -euo pipefail

FRONTEND="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$(cd "$FRONTEND/.." && pwd)/front-build"

PUSH=1
GIT=1
for arg in "$@"; do
  case "$arg" in
    --no-push) PUSH=0 ;;
    --dry) GIT=0; PUSH=0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

cd "$FRONTEND"

# ---------------------------------------------------------------- build ----
# NODE_ENV=production makes Next read .env.production (and never
# .env.development.local, which holds the localhost API URL).
echo "==> building"
NODE_ENV=production npm run build

if [ ! -d .next ]; then
  echo "build produced no .next directory" >&2
  exit 1
fi

# --------------------------------------------------------------- config ----
# next.config.ts is TypeScript; the server installs no typescript (it is a
# devDependency), so compile it to plain CommonJS for the deploy folder.
echo "==> compiling next.config.ts"
TMPCFG="$(mktemp -d)"
trap 'rm -rf "$TMPCFG"' EXIT
# --skipLibCheck: we are transpiling one small file, not type-checking Next's
# own .d.ts files (which do not compile under these standalone flags).
npx tsc next.config.ts \
  --module commonjs --target es2022 \
  --esModuleInterop --skipLibCheck \
  --outDir "$TMPCFG"

if [ ! -f "$TMPCFG/next.config.js" ]; then
  echo "next.config.ts did not compile" >&2
  exit 1
fi

# tsc emits `exports.default = …`; Next reads a .js config as the whole module
# object, so unwrap it — otherwise every option is silently ignored and only a
# faint "Unrecognized key(s): __esModule, default" warning appears.
printf '\nmodule.exports = module.exports.default;\n' >> "$TMPCFG/next.config.js"

# ----------------------------------------------------------------- sync ----
echo "==> syncing into $OUT"
mkdir -p "$OUT"

# --delete removes files a previous build left behind, so stale hashed chunks
# do not pile up. /cache is the runtime ISR cache, /dev is left over from `npm run dev`, and
# /types + /diagnostics + trace are build-time only — none of them are read by
# a production server. Leading slashes anchor each pattern to .next/ itself.
rsync -a --delete --delete-excluded \
  --exclude "/cache/" \
  --exclude "/dev/" \
  --exclude "/types/" \
  --exclude "/diagnostics/" \
  --exclude "/trace" \
  .next/ "$OUT/.next/"

rsync -a --delete public/ "$OUT/public/"

cp package.json package-lock.json "$OUT/"
cp "$TMPCFG/next.config.js" "$OUT/next.config.js"
cp deploy/server.js "$OUT/server.js"
cp deploy/gitignore "$OUT/.gitignore"
[ -f deploy/README.md ] && cp deploy/README.md "$OUT/README.md"

echo "==> output: $(du -sh "$OUT" | cut -f1)"

if [ "$GIT" -eq 0 ]; then
  echo "==> --dry: skipping git"
  exit 0
fi

# ------------------------------------------------------------------ git ----
cd "$OUT"
if [ ! -d .git ]; then
  echo "front-build is not a git repo yet — run: git init -b main && git remote add origin <deploy-repo-url>" >&2
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "==> nothing changed, no commit"
  exit 0
fi

SRC_REV="$(git -C "$FRONTEND" rev-parse --short HEAD 2>/dev/null || echo "unknown")"
git commit -q -m "build $(date +%Y-%m-%d\ %H:%M) (src ${SRC_REV})"
echo "==> committed $(git rev-parse --short HEAD)"

if [ "$PUSH" -eq 1 ]; then
  git push -q origin main
  echo "==> pushed to origin/main"
else
  echo "==> not pushed (--no-push)"
fi
