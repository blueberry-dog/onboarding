#!/usr/bin/env bash
set -e

echo "Uninstalling Specstory wrapper…"

# Remove wrapper binary
if [[ -f "$HOME/bin/specstory" ]]; then
  echo "➡ Removing ~/bin/specstory"
  rm "$HOME/bin/specstory"
fi

# Remove wrapper folder
if [[ -d "$HOME/.specstory_wrapper" ]]; then
  echo "➡ Removing ~/.specstory_wrapper"
  rm -rf "$HOME/.specstory_wrapper"
fi

# Remove 'claude' alias from shell profiles if present
for PROFILE in "$HOME/.zshrc" "$HOME/.bashrc"; do
  if [[ -f "$PROFILE" ]] && grep -qE '^[[:space:]]*alias[[:space:]]+claude=' "$PROFILE" 2>/dev/null; then
    echo "➡ Removing claude alias from $PROFILE"
    # macOS/BSD sed requires an empty string argument to -i
    sed -i '' '/^[[:space:]]*alias[[:space:]]\+claude=/d' "$PROFILE"
  fi
done

# Remove conda activation hook(s) that set a claude alias
if command -v conda >/dev/null 2>&1; then
  # Iterate all env paths reported by conda
  while IFS= read -r ENV_PATH; do
    [[ -z "$ENV_PATH" ]] && continue
    HOOK_DIR="$ENV_PATH/etc/conda/activate.d"
    HOOK_FILE="$HOOK_DIR/specstory.sh"
    if [[ -f "$HOOK_FILE" ]]; then
      echo "➡ Removing conda activation hook $HOOK_FILE"
      rm -f "$HOOK_FILE"
    fi
  done < <(conda env list 2>/dev/null | awk 'NR>2 && NF {print $NF}')
fi

# Restore original Homebrew binary
BREW_BIN="$(brew --prefix 2>/dev/null)/bin/specstory"
BREW_REAL="$(brew --prefix 2>/dev/null)/bin/specstory-real"

if [[ -f "$BREW_REAL" && ! -f "$BREW_BIN" ]]; then
  echo "➡ Restoring specstory-real → specstory"
  mv "$BREW_REAL" "$BREW_BIN"
fi

echo "Uninstall complete!"
