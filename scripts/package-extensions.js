const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXTENSIONS_DIR = path.join(__dirname, '..', 'extensions');
const OUTPUT_DIR = path.join(__dirname, '..', 'dist', 'extensions');
const BRANDING_DIR = path.join(__dirname, '..', 'branding');

function getExtensionDirs() {
  return fs.readdirSync(EXTENSIONS_DIR).filter(name => {
    const pkgPath = path.join(EXTENSIONS_DIR, name, 'package.json');
    return fs.existsSync(pkgPath);
  });
}

function readPackageJson(dir) {
  const pkgPath = path.join(dir, 'package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function packageExtension(extName) {
  const extDir = path.join(EXTENSIONS_DIR, extName);
  const pkg = readPackageJson(extDir);
  const outDir = path.join(OUTPUT_DIR, extName);
  
  console.log(`\n📦 Packaging ${extName} v${pkg.version}...`);
  
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true });
  }
  fs.mkdirSync(outDir, { recursive: true });
  
  const filesToCopy = [
    'package.json',
    'README.md',
    'out',
    'media',
    'themes',
    'snippets',
    'assets'
  ];
  
  for (const file of filesToCopy) {
    const srcPath = path.join(extDir, file);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(outDir, file);
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  if (fs.existsSync(path.join(extDir, 'package.json'))) {
    const extPkg = readPackageJson(extDir);
    const prodDeps = {};
    if (extPkg.dependencies) {
      for (const [name, version] of Object.entries(extPkg.dependencies)) {
        if (!name.startsWith('@types/')) {
          prodDeps[name] = version;
        }
      }
    }
    
    const distPkg = {
      name: extPkg.name,
      displayName: extPkg.displayName,
      description: extPkg.description,
      version: extPkg.version,
      publisher: extPkg.publisher,
      engines: extPkg.engines,
      categories: extPkg.categories,
      activationEvents: extPkg.activationEvents,
      main: extPkg.main,
      contributes: extPkg.contributes,
      dependencies: prodDeps,
      keywords: extPkg.keywords
    };
    
    fs.writeFileSync(
      path.join(outDir, 'package.json'),
      JSON.stringify(distPkg, null, 2)
    );
  }
  
  console.log(`  ✓ ${extName} packaged`);
  return true;
}

function createExtensionManifest() {
  const extensions = getExtensionDirs();
  const manifest = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    extensions: []
  };
  
  for (const extName of extensions) {
    const extDir = path.join(EXTENSIONS_DIR, extName);
    const pkg = readPackageJson(extDir);
    manifest.extensions.push({
      id: `${pkg.publisher}.${pkg.name}`,
      name: pkg.name,
      displayName: pkg.displayName,
      version: pkg.version,
      description: pkg.description,
      categories: pkg.categories,
      path: extName
    });
  }
  
  const manifestPath = path.join(OUTPUT_DIR, 'extensions.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Extension manifest created`);
}

function createInjectScript() {
  const injectScript = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const CODE_OSS_DIR = process.env.CODE_OSS_DIR || path.join(__dirname, '..', '..', 'code-oss');
const EXTENSIONS_SOURCE = path.join(__dirname, '..', 'extensions');

function getExtensionDirs(dir) {
  return fs.readdirSync(dir).filter(name => {
    return fs.existsSync(path.join(dir, name, 'package.json'));
  });
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function injectBranding() {
  const productJsonPath = path.join(CODE_OSS_DIR, 'product.json');
  const brandingPath = path.join(__dirname, '..', '..', 'branding', 'product.json');
  
  if (fs.existsSync(brandingPath) && fs.existsSync(productJsonPath)) {
    const branding = JSON.parse(fs.readFileSync(brandingPath, 'utf-8'));
    const product = JSON.parse(fs.readFileSync(productJsonPath, 'utf-8'));
    
    Object.assign(product, branding);
    fs.writeFileSync(productJsonPath, JSON.stringify(product, null, 2));
    console.log('✓ Branding injected');
  }
}

function injectExtensions() {
  const targetDir = path.join(CODE_OSS_DIR, 'extensions');
  
  if (!fs.existsSync(targetDir)) {
    console.log('⚠ Code-OSS extensions directory not found, skipping extension injection');
    return;
  }
  
  const extensions = getExtensionDirs(EXTENSIONS_SOURCE);
  let count = 0;
  
  for (const ext of extensions) {
    const src = path.join(EXTENSIONS_SOURCE, ext);
    const dest = path.join(targetDir, ext);
    
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true });
    }
    
    copyDir(src, dest);
    count++;
    console.log('✓ Injected:', ext);
  }
  
  console.log('Injected ' + count + ' extensions');
}

console.log('Injecting MyCode-AI customizations into Code-OSS...');
injectBranding();
injectExtensions();
console.log('Done!');
`;

  const scriptPath = path.join(__dirname, 'inject-into-code-oss.js');
  fs.writeFileSync(scriptPath, injectScript);
  fs.chmodSync(scriptPath, '755');
  console.log(`  ✓ Inject script created`);
}

function main() {
  console.log('🔨 MyCode-AI Extension Packager');
  console.log('=' .repeat(50));
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const extensions = getExtensionDirs();
  console.log(`\nFound ${extensions.length} extensions:\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const ext of extensions) {
    try {
      packageExtension(ext);
      success++;
    } catch (err) {
      console.error(`  ✗ ${ext}: ${err.message}`);
      failed++;
    }
  }
  
  createExtensionManifest();
  createInjectScript();
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📦 Packaged: ${success}, Failed: ${failed}`);
  
  if (failed > 0) {
    process.exit(1);
  }
  
  console.log(`\n✅ All extensions packaged successfully!`);
  console.log(`   Output: ${OUTPUT_DIR}`);
}

main();
