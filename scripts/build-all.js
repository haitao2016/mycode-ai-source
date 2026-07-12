#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXTENSIONS_DIR = path.join(__dirname, '..', 'extensions');

function getExtensionDirs(dir) {
  return fs.readdirSync(dir).filter(name => {
    return fs.existsSync(path.join(dir, name, 'package.json'));
  });
}

function buildExtension(extName) {
  const extPath = path.join(EXTENSIONS_DIR, extName);
  const packageJsonPath = path.join(extPath, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠ Skipping ${extName}: no package.json`);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  if (!packageJson.scripts || !packageJson.scripts.compile) {
    console.log(`⚠ Skipping ${extName}: no compile script`);
    return false;
  }

  console.log(`\n🔨 Building ${extName}...`);

  try {
    // Check if node_modules exists, if not run npm install
    if (!fs.existsSync(path.join(extPath, 'node_modules'))) {
      console.log(`  📦 Installing dependencies for ${extName}...`);
      execSync('npm install', { cwd: extPath, stdio: 'inherit' });
    }

    execSync('npm run compile', { cwd: extPath, stdio: 'inherit' });
    console.log(`✅ ${extName} built successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${extName} build failed`);
    return false;
  }
}

console.log('Building all MyCode-AI extensions...\n');

const extensions = getExtensionDirs(EXTENSIONS_DIR);
let successCount = 0;
let failCount = 0;
let skipCount = 0;

for (const ext of extensions) {
  const result = buildExtension(ext);
  if (result === true) {
    successCount++;
  } else if (result === false) {
    failCount++;
  } else {
    skipCount++;
  }
}

console.log(`\n📊 Build Summary: ${successCount} succeeded, ${failCount} failed, ${skipCount} skipped`);
console.log(`   Total extensions: ${extensions.length}`);

if (failCount > 0) {
  process.exit(1);
}
