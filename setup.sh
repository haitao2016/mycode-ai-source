#!/bin/bash
# MyCode-AI 一键搭建脚本
# 使用方法: ./setup.sh
#
# 功能:
#   1. 检查环境（Node.js 20, git, 系统依赖）
#   2. 克隆 Code-OSS 源码
#   3. 安装所有依赖
#   4. 注入 MyCode-AI 扩展和品牌
#   5. 编译所有 AI 扩展
#   6. 编译 Code-OSS（可选，需要 8GB+ RAM）
#   7. 启动 MyCode-AI（可选）

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
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
info() { echo -e "${BLUE}[$(date +%H:%M:%S)] INFO:${NC} $1"; }

OS="$(uname -s)"
ARCH="$(uname -m)"

check_prerequisites() {
    log "检查环境..."

    # Git
    if ! command -v git &> /dev/null; then
        err "未安装 git，请先安装: https://git-scm.com/downloads"
        exit 1
    fi
    info "git: $(git --version | awk '{print $3}')"

    # Node.js
    if command -v node &> /dev/null; then
        NODE_VER=$(node --version)
        if [[ "$NODE_VER" != v20.* ]]; then
            warn "Node.js 版本为 $NODE_VER，推荐使用 v20.x"
            warn "建议使用 nvm 安装: nvm install 20.18.0 && nvm use 20.18.0"
        else
            info "Node.js: $NODE_VER ✓"
        fi
    else
        err "未安装 Node.js，请安装 v20.x 版本"
        err "推荐使用 nvm: https://github.com/nvm-sh/nvm"
        exit 1
    fi

    # npm
    if command -v npm &> /dev/null; then
        info "npm: $(npm --version)"
    else
        err "未安装 npm"
        exit 1
    fi

    # RAM check
    if [[ "$OS" == "Linux" ]]; then
        TOTAL_RAM=$(free -m | awk '/^Mem:/ {print $2}')
        info "内存: ${TOTAL_RAM}MB"
        if [ "$TOTAL_RAM" -lt 6000 ]; then
            warn "内存不足 6GB，Code-OSS 编译可能失败"
            warn "建议 8GB+ RAM"
        fi
    elif [[ "$OS" == "Darwin" ]]; then
        TOTAL_RAM=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024)}')
        info "内存: ${TOTAL_RAM}MB"
        if [ "$TOTAL_RAM" -lt 6000 ]; then
            warn "内存不足 6GB，Code-OSS 编译可能失败"
            warn "建议 8GB+ RAM"
        fi
    fi

    info "系统: $OS / $ARCH"
    log "环境检查完成"
}

install_system_deps() {
    log "检查系统依赖..."

    if [[ "$OS" == "Linux" ]]; then
        if command -v apt-get &> /dev/null; then
            info "使用 apt-get 安装依赖..."
            sudo apt-get update -qq
            sudo apt-get install -y -qq \
                libkrb5-dev libxkbfile-dev libx11-dev \
                libxkbcommon-dev libgbm-dev libcups2-dev \
                libgtk-3-dev libnotify4 libnss3-dev libxtst-dev \
                build-essential python3 2>/dev/null || true
        elif command -v dnf &> /dev/null; then
            info "使用 dnf 安装依赖..."
            sudo dnf install -y \
                krb5-devel libxkbfile-devel libX11-devel \
                gtk3-devel libnotify-devel nss-devel \
                libXtst-devel gcc-c++ python3 2>/dev/null || true
        fi
    elif [[ "$OS" == "Darwin" ]]; then
        if command -v brew &> /dev/null; then
            info "使用 homebrew 安装依赖..."
            brew install python@3 2>/dev/null || true
        fi
    fi

    log "系统依赖处理完成"
}

clone_code_oss() {
    if [ -d "$CODE_OSS_DIR" ] && [ -f "$CODE_OSS_DIR/package.json" ]; then
        info "Code-OSS 已存在，跳过克隆"
        return
    fi

    log "克隆 Code-OSS 源码..."
    info "这可能需要几分钟..."

    git clone --depth 1 -b 1.95.3 \
        https://github.com/microsoft/vscode.git \
        "$CODE_OSS_DIR" 2>&1 | tail -5

    if [ ! -f "$CODE_OSS_DIR/package.json" ]; then
        err "Code-OSS 克隆失败"
        exit 1
    fi

    log "Code-OSS 克隆完成"
}

install_dependencies() {
    log "安装依赖..."

    # 安装扩展依赖并编译
    info "编译 MyCode-AI 扩展..."
    cd "$ROOT_DIR"
    node scripts/build-extensions.js

    # Code-OSS 依赖
    if [ -d "$CODE_OSS_DIR" ]; then
        info "安装 Code-OSS 依赖..."
        cd "$CODE_OSS_DIR"
        npm install --ignore-scripts 2>&1 | tail -5

        if [ -d "build" ]; then
            cd build && npm install --ignore-scripts 2>&1 | tail -5
            cd ..
        fi

        if [ -d "extensions" ]; then
            cd extensions && npm install --ignore-scripts 2>&1 | tail -5
            cd ..
        fi
    fi

    log "依赖安装完成"
}

inject_customizations() {
    if [ ! -d "$CODE_OSS_DIR" ]; then
        warn "Code-OSS 不存在，跳过注入"
        return
    fi

    log "注入 MyCode-AI 扩展和品牌..."
    cd "$ROOT_DIR"
    CODE_OSS_DIR="$CODE_OSS_DIR" node scripts/inject-into-code-oss.js
    log "注入完成"
}

compile_code_oss() {
    if [ ! -d "$CODE_OSS_DIR" ]; then
        warn "Code-OSS 不存在，跳过编译"
        return
    fi

    log "编译 Code-OSS..."
    info "需要 8GB+ RAM，可能需要 5-15 分钟..."

    cd "$CODE_OSS_DIR"
    node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile 2>&1 | tail -10

    if [ -f "out/main.js" ]; then
        log "Code-OSS 编译成功！"
    else
        warn "编译可能未完全完成，请检查输出"
    fi
}

show_help() {
    echo ""
    echo "MyCode-AI 一键搭建脚本"
    echo ""
    echo "用法: ./setup.sh [选项]"
    echo ""
    echo "选项:"
    echo "  --skip-clone      跳过 Code-OSS 克隆"
    echo "  --skip-compile    跳过 Code-OSS 编译"
    echo "  --compile         编译 Code-OSS（需要 8GB+ RAM）"
    echo "  --help            显示此帮助"
    echo ""
    echo "示例:"
    echo "  ./setup.sh                    # 基础搭建（不编译 Code-OSS）"
    echo "  ./setup.sh --compile          # 完整搭建 + 编译"
    echo "  ./setup.sh --skip-clone       # 已克隆 Code-OSS 时使用"
    echo ""
}

# Main
echo ""
echo "========================================"
echo "  MyCode-AI 一键搭建脚本"
echo "========================================"
echo ""

SKIP_CLONE=false
SKIP_COMPILE=true
COMPILE=false

for arg in "$@"; do
    case "$arg" in
        --skip-clone) SKIP_CLONE=true ;;
        --skip-compile) SKIP_COMPILE=true ;;
        --compile) COMPILE=true ;;
        --help|-h) show_help; exit 0 ;;
        *) err "未知选项: $arg"; show_help; exit 1 ;;
    esac
done

START_TIME=$(date +%s)

check_prerequisites
install_system_deps

if [ "$SKIP_CLONE" = false ]; then
    clone_code_oss
fi

install_dependencies
inject_customizations

if [ "$COMPILE" = true ]; then
    compile_code_oss
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "========================================"
echo "  搭建完成！"
echo "========================================"
echo ""
echo "  耗时: ${DURATION}秒"
echo ""
echo "  已完成:"
echo "    ✓ 环境检查"
echo "    ✓ 系统依赖"
echo "    ✓ Code-OSS 源码"
echo "    ✓ 9 个 AI 扩展编译"
echo "    ✓ 扩展注入 Code-OSS"
echo "    ✓ 品牌定制应用"
echo ""

if [ "$COMPILE" = true ]; then
    echo "    ✓ Code-OSS 编译"
    echo ""
    echo "  启动 MyCode-AI:"
    echo "    cd code-oss && ./scripts/code.sh"
else
    echo ""
    echo "  下一步:"
    echo "    编译 Code-OSS (需要 8GB+ RAM):"
    echo "      ./setup.sh --compile"
    echo ""
    echo "    或手动编译:"
    echo "      cd code-oss"
    echo "      node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js compile"
    echo ""
    echo "    编译完成后启动:"
    echo "      cd code-oss && ./scripts/code.sh"
fi

echo ""
