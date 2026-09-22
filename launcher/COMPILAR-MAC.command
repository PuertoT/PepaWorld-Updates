#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then
  echo 'Instala Node.js LTS desde https://nodejs.org y vuelve a ejecutar este archivo.'
  exit 1
fi
npm ci
npm test
npm run dist:mac
echo 'DMG creado en dist para la arquitectura de este Mac.'
