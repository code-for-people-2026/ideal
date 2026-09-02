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

for root_file in index.html prototype-nav.css prototype-shell.css prototype-shell.js CNAME; do
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
    find "$prototype_root" \
      \( -type d \( -name archive -o -name brand-exploration -o -name history \) -prune \) -o \
      -type f \
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

# Keep previously published Chinese routes working without keeping Chinese source
# directories in the repository. The copies preserve deep historical links; the
# root pages below immediately point visitors at the canonical English routes.
copy_legacy_tree() {
  local source_dir="$1"
  local legacy_dir="$2"

  mkdir -p "$output_dir/$legacy_dir"
  cp -a "$output_dir/$source_dir/." "$output_dir/$legacy_dir/"
}

create_redirect() {
  local relative_path="$1"
  local target_url="$2"
  local redirect_file="$output_dir/$relative_path"

  mkdir -p "$(dirname "$redirect_file")"
  {
    printf '%s\n' '<!doctype html>'
    printf '%s\n' '<html lang="zh-CN">'
    printf '%s\n' '  <head>'
    printf '%s\n' '    <meta charset="UTF-8" />'
    printf '%s\n' '    <meta name="viewport" content="width=device-width, initial-scale=1" />'
    printf '%s\n' '    <meta name="robots" content="noindex" />'
    printf '%s\n' "    <meta http-equiv=\"refresh\" content=\"0; url=$target_url\" />"
    printf '%s\n' "    <link rel=\"canonical\" href=\"$target_url\" />"
    printf '%s\n' '    <title>原型入口已移动</title>'
    printf '%s\n' '    <script>'
    printf '%s\n' '      (() => {'
    printf '%s\n' "        const target = new URL(\"$target_url\");"
    printf '%s\n' '        target.search = window.location.search;'
    printf '%s\n' '        target.hash = window.location.hash;'
    printf '%s\n' '        window.location.replace(target.href);'
    printf '%s\n' '      })();'
    printf '%s\n' '    </script>'
    printf '%s\n' '  </head>'
    printf '%s\n' '  <body>'
    printf '%s\n' "    <p>原型入口已移动到 <a href=\"$target_url\">新的英文路径</a>。</p>"
    printf '%s\n' '  </body>'
    printf '%s\n' '</html>'
  } > "$redirect_file"
}

copy_legacy_tree "3.2-neighborhood-mutual-aid-team" "牛马互助平台"
copy_legacy_tree "kith-inn" "街坊味"
copy_legacy_tree "hallway-harmony" "楼道回收提醒"
copy_legacy_tree "meal-mind" "排好菜"
copy_legacy_tree "4.1-cyber-math" "赛博数学"

create_redirect "牛马互助平台/index.html" "https://ideal.codeforpeople.cn/3.2-neighborhood-mutual-aid-team/"
create_redirect "牛马互助平台/消费者联盟-亲历推荐-prototype.html" "https://ideal.codeforpeople.cn/3.2-neighborhood-mutual-aid-team/"
create_redirect "牛马互助平台/近邻互助组-客户体验-prototype.html" "https://ideal.codeforpeople.cn/3.2-neighborhood-mutual-aid-team/prototype-customer/"
create_redirect "牛马互助平台/近邻互助组-实施对照-prototype.html" "https://ideal.codeforpeople.cn/3.2-neighborhood-mutual-aid-team/prototype-implementation/"
create_redirect "街坊味/index.html" "https://ideal.codeforpeople.cn/kith-inn/"
create_redirect "楼道回收提醒/index.html" "https://ideal.codeforpeople.cn/hallway-harmony/"
create_redirect "排好菜/index.html" "https://ideal.codeforpeople.cn/meal-mind/"
create_redirect "赛博数学/index.html" "https://ideal.codeforpeople.cn/4.1-cyber-math/"

python3 "$repo_root/scripts/check-public-prototype-shell.py" "$output_dir"

touch "$output_dir/.nojekyll"

echo "Pages artifact created at $output_dir"
