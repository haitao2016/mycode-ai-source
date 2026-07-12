#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const CODE_OSS_DIR = process.env.CODE_OSS_DIR || path.join(__dirname, '..', 'code-oss');
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
  const backupPath = productJsonPath + '.backup';
  
  if (!fs.existsSync(brandingPath)) {
    console.log('⚠ Branding file not found, skipping branding injection');
    console.log('  Expected path:', brandingPath);
    return true;
  }
  
  if (!fs.existsSync(productJsonPath)) {
    console.log('⚠ Product.json file not found in Code-OSS directory, skipping branding injection');
    console.log('  Expected path:', productJsonPath);
    return true;
  }
  
  try {
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
    
    fs.copyFileSync(productJsonPath, backupPath);
    console.log('✓ Backup created');
    
    let branding;
    try {
      const brandingContent = fs.readFileSync(brandingPath, 'utf-8');
      branding = JSON.parse(brandingContent);
    } catch (error) {
      throw new Error(`Failed to read or parse branding file: ${error.message}`);
    }
    
    let product;
    try {
      const productContent = fs.readFileSync(productJsonPath, 'utf-8');
      product = JSON.parse(productContent);
    } catch (error) {
      throw new Error(`Failed to read or parse product.json: ${error.message}`);
    }
    
    const mergedProduct = { ...product, ...branding };
    
    try {
      fs.writeFileSync(productJsonPath, JSON.stringify(mergedProduct, null, 2));
      console.log('✓ Branding injected successfully');
      
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }
    } catch (error) {
      throw new Error(`Failed to write product.json: ${error.message}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('✗ Branding injection failed:', error.message);
    
    if (fs.existsSync(backupPath)) {
      try {
        fs.copyFileSync(backupPath, productJsonPath);
        console.log('✓ Restored from backup');
        fs.unlinkSync(backupPath);
      } catch (restoreError) {
        console.error('✗ Failed to restore backup:', restoreError.message);
      }
    }
    
    return false;
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
const brandingSuccess = injectBranding();
injectExtensions();
console.log('Done!');

if (!brandingSuccess) {
  process.exit(1);
}
