#!/usr/bin/env sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT INT TERM
generated_root="$repo_root/.frameworks-generated"

if [ -f "$repo_root/apps/commerce/medusa-config.ts" ] || [ -f "$repo_root/apps/cms/src/index.ts" ]; then
  echo "Framework applications already appear initialized; refusing to overwrite them."
  exit 1
fi

if [ -e "$generated_root" ]; then
  echo "$generated_root already exists; refusing to overwrite reviewed output."
  exit 1
fi

echo "Generating official Medusa v2 project in an isolated temporary directory..."
cd "$work_dir"
printf 'n\n' | CI=1 npx --yes create-medusa-app@latest commerce-generated --use-npm --skip-db --no-browser

echo "Generating official Strapi 5 TypeScript/PostgreSQL project in an isolated temporary directory..."
npx --yes create-strapi@latest cms-generated \
  --typescript --use-npm --install --no-run --no-git-init --no-example \
  --skip-cloud --non-interactive --dbclient postgres --dbhost localhost --dbport 5432 \
  --dbname dalizebo_cms --dbusername dalizebo --dbpassword dalizebo_local --dbssl=false

mkdir "$generated_root"
mv "$work_dir/commerce-generated" "$generated_root/commerce"
mv "$work_dir/cms-generated" "$generated_root/cms"
echo "Generation succeeded in $generated_root. Review against ARCHITECTURE.md before importing."
echo "No repository files were overwritten."
