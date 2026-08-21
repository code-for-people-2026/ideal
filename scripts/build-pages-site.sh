#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
requested_output="${1:-$repo_root/_site}"

mkdir -p "$requested_output"
output_dir="$(cd "$requested_output" && pwd -P)"

case "$output_dir" in
  "$repo_root")
    echo "Refusing to replace the repository root." >&2
    exit 1
    ;;
  "$repo_root"/*|/tmp/*|/private/tmp/*)
    ;;
  *)
    echo "Output must be inside the repository or a temporary directory: $output_dir" >&2
    exit 1
    ;;
esac

find "$output_dir" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +

copy_file() {
  local source_file="$1"
  local relative_path="${source_file#"$repo_root/"}"

  mkdir -p "$output_dir/$(dirname "$relative_path")"
  cp "$source_file" "$output_dir/$relative_path"
}

for root_file in index.html prototype-nav.css prototype-shell.css CNAME; do
  if [[ ! -f "$repo_root/$root_file" ]]; then
    echo "Missing required Pages file: $root_file" >&2
    exit 1
  fi
  copy_file "$repo_root/$root_file"
done

prototype_manifest="$repo_root/pages-prototypes.txt"
if [[ ! -f "$prototype_manifest" ]]; then
  echo "Missing Pages prototype manifest: pages-prototypes.txt" >&2
  exit 1
fi

while IFS= read -r prototype_dir || [[ -n "$prototype_dir" ]]; do
  prototype_dir="${prototype_dir%%#*}"
  prototype_dir="${prototype_dir#"${prototype_dir%%[![:space:]]*}"}"
  prototype_dir="${prototype_dir%"${prototype_dir##*[![:space:]]}"}"

  [[ -z "$prototype_dir" ]] && continue

  if [[ "$prototype_dir" == */* || "$prototype_dir" == "." || "$prototype_dir" == ".." ]]; then
    echo "Prototype entries must be root-level directory names: $prototype_dir" >&2
    exit 1
  fi

  if [[ ! -d "$repo_root/$prototype_dir" ]]; then
    echo "Missing prototype directory: $prototype_dir" >&2
    exit 1
  fi

  prototype_root="$repo_root/$prototype_dir"
  # ponytail: empty sentinel keeps Bash 3.2 + `set -u` happy; loop bodies skip it.
  app_dirs=("")

  while IFS= read -r -d '' package_file; do
    app_dirs+=("$(dirname "$package_file")")
  done < <(find "$prototype_root" -mindepth 2 -maxdepth 2 -type f -name package.json -print0)

  while IFS= read -r -d '' source_file; do
    inside_app=false
    for app_dir in "${app_dirs[@]}"; do
      [[ -z "$app_dir" ]] && continue
      if [[ "$source_file" == "$app_dir"/* ]]; then
        inside_app=true
        break
      fi
    done

    [[ "$inside_app" == true ]] && continue
    copy_file "$source_file"
  done < <(
    find "$prototype_root" -type f \
      \( \
        -iname '*.html' -o -iname '*.htm' -o \
        -iname '*.css' -o -iname '*.js' -o -iname '*.mjs' -o -iname '*.json' -o \
        -iname '*.svg' -o -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o \
        -iname '*.gif' -o -iname '*.webp' -o -iname '*.avif' -o -iname '*.ico' -o \
        -iname '*.woff' -o -iname '*.woff2' -o -iname '*.ttf' -o -iname '*.otf' -o \
        -iname '*.mp4' -o -iname '*.webm' -o -iname '*.mp3' -o -iname '*.wav' -o \
        -iname '*.ogg' -o -iname '*.pdf' -o -iname '*.webmanifest' \
      \) -print0
  )

  for app_dir in "${app_dirs[@]}"; do
    [[ -z "$app_dir" ]] && continue
    app_path="${app_dir#"$repo_root/"}"
    echo "Building $app_path for GitHub Pages"
    npm --prefix "$app_dir" ci
    npm --prefix "$app_dir" run build:pages

    app_output="$app_dir/dist/client"
    if [[ ! -f "$app_output/index.html" ]]; then
      echo "Missing built prototype entry: $app_output/index.html" >&2
      exit 1
    fi

    mkdir -p "$output_dir/$app_path"
    cp -a "$app_output/." "$output_dir/$app_path/"
  done
done < "$prototype_manifest"

python3 "$repo_root/scripts/check-public-prototype-shell.py" "$output_dir"

touch "$output_dir/.nojekyll"

echo "Pages artifact created at $output_dir"
