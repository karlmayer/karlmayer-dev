#!/usr/bin/env bash

usage() {
  cat <<'EOF'
Usage:
  scripts/rewrite-path-history.sh <path> [--yes]

Examples:
  scripts/rewrite-path-history.sh pages/blog --yes
  scripts/rewrite-path-history.sh pages/blog

What it does:
1. Backs up the current version of <path> to a temp directory.
2. Rewrites git history to remove <path> from all commits.
3. Restores <path> from backup and commits it as a fresh baseline.

Notes:
- Requires a clean working tree.
- Uses git-filter-repo when available, otherwise falls back to git filter-branch.
- You still need to force-push rewritten history.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" || $# -lt 1 ]]; then
  usage
  return 0
fi

TARGET_PATH="$1"
CONFIRM_FLAG="${2:-}"

if [[ "$CONFIRM_FLAG" != "--yes" ]]; then
  echo "This rewrites git history for '$TARGET_PATH'."
  echo "Re-run with --yes to continue."
  return 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository."
  return 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if [[ ! -e "$TARGET_PATH" ]]; then
  echo "Error: path '$TARGET_PATH' does not exist in working tree."
  return 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean. Commit or stash changes first."
  return 1
fi

BACKUP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$BACKUP_DIR"
}
trap cleanup EXIT

mkdir -p "$BACKUP_DIR/$(dirname "$TARGET_PATH")"
cp -a "$TARGET_PATH" "$BACKUP_DIR/$TARGET_PATH"

if command -v git-filter-repo >/dev/null 2>&1; then
  echo "Using git-filter-repo to rewrite history..."
  git filter-repo --force --path "$TARGET_PATH" --invert-paths
else
  echo "git-filter-repo not found; falling back to git filter-branch..."
  FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force \
    --index-filter "git rm -r --cached --ignore-unmatch -- '$TARGET_PATH'" \
    --prune-empty --tag-name-filter cat -- --all

  # Remove backup refs left by filter-branch so GC can clean old objects.
  git for-each-ref --format='%(refname)' refs/original/ | xargs -r -n 1 git update-ref -d
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
fi

mkdir -p "$(dirname "$TARGET_PATH")"
rm -rf "$TARGET_PATH"
cp -a "$BACKUP_DIR/$TARGET_PATH" "$TARGET_PATH"

git add "$TARGET_PATH"
git commit -m "Add $TARGET_PATH"

echo
echo "History rewrite complete."
echo "Next steps:"
echo "1. Verify history for the path: git log -- $TARGET_PATH"
echo "2. Force-push all branches/tags as needed:"
echo "   git push --force-with-lease --all"
echo "   git push --force-with-lease --tags"
