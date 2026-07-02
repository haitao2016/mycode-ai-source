#!/bin/bash
# MyCode-AI Complete Build Script
# Builds Code-OSS with all MyCode-AI extensions and branding
#
# Requirements:
#   - Node.js 20.18.0 (use nvm: nvm install 20.18.0 && nvm use 20.18.0)
#   - System deps: libkrb5-dev libxkbfile-dev libx11-dev libgtk-3-dev libnss3-dev
#   - 8GB+ RAM (or swap)
#   - Network access for npm and Electron downloads
#
# Usage:
#   ./scripts/build-mycode-ai.sh [step]
#
# Steps:
#   all       - Run all steps (default)
#   deps      - Install dependencies only
#   compile   - Compile Code-OSS only
#   inject    - Inject extensions and branding only
#   package   - Package for release only

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CODE_OSS_DIR="$ROOT_DIR/code-oss"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARN:${NC} $1"; }
err()  { echo -e "${RED}[$(date +%H:%M:%S)] ERROR:${NC} $1"; }

STEP="${1:-all}"

check_node() {
    local version=$(node --version 2>/dev/null || echo "none")
    if [[ "$version" != "v20."* ]]; then
        err "Node.js 20.x required, got $version"
        err "Run: nvm install 20.18.0 && nvm use 20.18.0"
        exit 1
    fi
    log "Node.js: $version"
}

install_system_deps() {
    log "Installing system dependencies..."
    apt-get update -qq
    apt-get install -y -qq libkrb5-dev libxkbfile-dev libx11-dev \
        libxkbcommon-dev libgbm-dev libcups2-dev libgtk-3-dev \
        libnotify4 libnss3-dev libxtst-dev xauth 2>/dev/null || true
    log "System dependencies installed"
}

install_code_oss_deps() {
    log "Installing Code-OSS dependencies..."
    cd "$CODE_OSS_DIR"
    npm install --ignore-scripts
    cd "$CODE_OSS_DIR/build"
    npm install --ignore-scripts
    cd "$CODE_OSS_DIR/extensions"
    npm install --ignore-scripts
    log "Code-OSS dependencies installed"
}

compile_code_oss() {
    log "Compiling Code-OSS core..."
    cd "$CODE_OSS_DIR"
    node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile-client
    log "Code-OSS core compiled"

    log "Compiling Code-OSS extensions..."
    node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile-extension:mycode-ai-main
    node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile-extension:mycode-ai-chat
    node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile-extension:mycode-ai-agent
    node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile-extension:mycode-ai-completion
    node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile-extension:mycode-ai-review
    node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile-extension:mycode-ai-search
    node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile-extension:mycode-ai-refactor
    node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile-extension:mycode-ai-debug
    log "All extensions compiled"
}

inject_customizations() {
    log "Injecting MyCode-AI extensions and branding..."
    cd "$ROOT_DIR"
    CODE_OSS_DIR="$CODE_OSS_DIR" node scripts/inject-into-code-oss.js
    log "Customizations injected"
}

package_release() {
    log "Packaging for release..."
    cd "$ROOT_DIR"
    node scripts/build-release.js
    log "Release packaged"
}

run_code_oss() {
    log "Starting MyCode-AI (Code-OSS)..."
    cd "$CODE_OSS_DIR"
    if [ -f "./scripts/code.sh" ]; then
        ./scripts/code.sh
    else
        err "scripts/code.sh not found. Ensure Code-OSS is properly compiled."
        exit 1
    fi
}

# Main
log "========================================"
log "  MyCode-AI Complete Build Script"
log "  Step: $STEP"
log "========================================"

check_node

case "$STEP" in
    all)
        install_system_deps
        install_code_oss_deps
        compile_code_oss
        inject_customizations
        package_release
        log "Build complete! Run './scripts/code.sh' in code-oss/ to start."
        ;;
    deps)
        install_system_deps
        install_code_oss_deps
        ;;
    compile)
        compile_code_oss
        ;;
    inject)
        inject_customizations
        ;;
    package)
        package_release
        ;;
    run)
        run_code_oss
        ;;
    *)
        err "Unknown step: $STEP"
        echo "Usage: $0 [all|deps|compile|inject|package|run]"
        exit 1
        ;;
esac

log "Done!"
