#!/bin/bash
# 导出项目源码包（不含 node_modules 和可重建文件）
set -e

OUTPUT_DIR="/workspace/dist/export"
OUTPUT_FILE="$OUTPUT_DIR/mycode-ai-source.zip"

mkdir -p "$OUTPUT_DIR"

echo "正在打包源码..."

cd /workspace

zip -r "$OUTPUT_FILE" \
  CODE_OSS_MIGRATION_PLAN.md \
  README.md \
  package.json \
  .nvmrc \
  --exclude='*/node_modules/*' \
  --exclude='*/.git/*' \
  --exclude='*/out/*' \
  --exclude='*/dist/*' \
  --exclude='*/.vscode-test/*' \
  2>/dev/null || true

# Extensions (source only)
for ext in extensions/*/; do
  ext_name=$(basename "$ext")
  zip -r "$OUTPUT_FILE" \
    "extensions/$ext_name/src/" \
    "extensions/$ext_name/package.json" \
    "extensions/$ext_name/tsconfig.json" \
    "extensions/$ext_name/media/" \
    "extensions/$ext_name/themes/" \
    "extensions/$ext_name/README.md" \
    2>/dev/null || true
done

# Branding
zip -r "$OUTPUT_FILE" branding/ 2>/dev/null || true

# Scripts
zip -r "$OUTPUT_FILE" scripts/ 2>/dev/null || true

# CI/CD
zip -r "$OUTPUT_FILE" .github/ 2>/dev/null || true

# Git config files
zip -r "$OUTPUT_FILE" .gitignore .nvmrc 2>/dev/null || true

echo ""
echo "打包完成！"
echo "文件: $OUTPUT_FILE"
ls -lh "$OUTPUT_FILE" | awk '{print "大小: " $5}'
