const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const EXTENSIONS_DIR = path.join(ROOT_DIR, 'extensions');

function getExtensions() {
  return fs.readdirSync(EXTENSIONS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name.startsWith('mycode-ai-'));
}

function installDeps(extName) {
  const extDir = path.join(EXTENSIONS_DIR, extName);
  const packageJsonPath = path.join(extDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return { skipped: true };
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  if (!packageJson.devDependencies && !packageJson.dependencies) {
    return { skipped: true };
  }

  const nodeModulesDir = path.join(extDir, 'node_modules');
  if (fs.existsSync(nodeModulesDir)) {
    return { alreadyInstalled: true };
  }

  try {
    console.log(`  Installing dependencies for ${extName}...`);
    execSync('npm install', { cwd: extDir, stdio: 'pipe' });
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

function compileExtension(extName) {
  const extDir = path.join(EXTENSIONS_DIR, extName);
  const packageJsonPath = path.join(extDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return { skipped: true, reason: 'no package.json' };
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  if (!packageJson.scripts?.compile) {
    return { skipped: true, reason: 'no compile script' };
  }

  const tsconfigPath = path.join(extDir, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    return { skipped: true, reason: 'no tsconfig.json' };
  }

  try {
    execSync('npm run compile', { cwd: extDir, stdio: 'pipe' });
    return { success: true };
  } catch (e) {
    return { error: e.stderr?.toString() || e.message };
  }
}

function main() {
  const extensions = getExtensions();
  console.log(`Found ${extensions.length} extensions:\n`);

  console.log('=== Step 1: Install Dependencies ===\n');
  let installSuccess = 0;
  let installSkipped = 0;
  let installFailed = 0;

  for (const ext of extensions) {
    const result = installDeps(ext);
    if (result.success) {
      console.log(`  ✓ ${ext}: dependencies installed`);
      installSuccess++;
    } else if (result.alreadyInstalled) {
      console.log(`  - ${ext}: already installed`);
      installSkipped++;
    } else if (result.skipped) {
      console.log(`  - ${ext}: skipped (no deps)`);
      installSkipped++;
    } else {
      console.log(`  ✗ ${ext}: ${result.error}`);
      installFailed++;
    }
  }

  console.log(`\n  Installed: ${installSuccess}, Skipped: ${installSkipped}, Failed: ${installFailed}\n`);

  console.log('=== Step 2: Compile Extensions ===\n');
  let compileSuccess = 0;
  let compileSkipped = 0;
  let compileFailed = 0;
  const failures = [];

  for (const ext of extensions) {
    const result = compileExtension(ext);
    if (result.success) {
      console.log(`  ✓ ${ext}: compiled successfully`);
      compileSuccess++;
    } else if (result.skipped) {
      console.log(`  - ${ext}: skipped (${result.reason})`);
      compileSkipped++;
    } else {
      console.log(`  ✗ ${ext}: compilation failed`);
      console.log(`    ${result.error?.split('\n').slice(0, 3).join('\n    ')}`);
      compileFailed++;
      failures.push({ name: ext, error: result.error });
    }
  }

  console.log(`\n  Compiled: ${compileSuccess}, Skipped: ${compileSkipped}, Failed: ${compileFailed}\n`);

  if (failures.length > 0) {
    console.log('=== Failures ===\n');
    for (const f of failures) {
      console.log(`${f.name}:`);
      console.log(f.error);
      console.log();
    }
    process.exit(1);
  }

  console.log('=== All extensions built successfully! ===');
}

main();
