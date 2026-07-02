#!/usr/bin/env node
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
