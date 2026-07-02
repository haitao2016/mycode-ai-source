const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CODE_OSS_DIR = path.join(ROOT_DIR, 'code-oss');
const BRANDING_DIR = path.join(ROOT_DIR, 'branding');

function applyBranding() {
  console.log('=== Applying MyCode-AI branding ===\n');

  if (!fs.existsSync(CODE_OSS_DIR)) {
    console.error('Error: code-oss directory not found.');
    console.error('Please run: git clone https://github.com/microsoft/vscode.git code-oss');
    process.exit(1);
  }

  applyProductJson();
  applyIcons();
  applyDefaultSettings();
  applyWelcomePage();

  console.log('\n=== Branding applied successfully ===');
}

function applyProductJson() {
  console.log('1. Applying product.json...');
  
  const sourcePath = path.join(BRANDING_DIR, 'product.json');
  const targetPath = path.join(CODE_OSS_DIR, 'product.json');

  if (!fs.existsSync(sourcePath)) {
    console.log('   Skip: branding/product.json not found');
    return;
  }

  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
  const sourceConfig = JSON.parse(sourceContent);

  let targetConfig = {};
  if (fs.existsSync(targetPath)) {
    const targetContent = fs.readFileSync(targetPath, 'utf-8');
    targetConfig = JSON.parse(targetContent);
  }

  const mergedConfig = { ...targetConfig, ...sourceConfig };
  fs.writeFileSync(targetPath, JSON.stringify(mergedConfig, null, 2) + '\n');
  
  console.log('   Done: product.json updated');
}

function applyIcons() {
  console.log('2. Applying application icons...');
  
  const iconsDir = path.join(BRANDING_DIR, 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    console.log('   Skip: icons directory not found');
    return;
  }

  const iconMappings = [
    { src: 'icon.png', dest: 'resources/linux/code.png' },
    { src: 'icon.icns', dest: 'resources/darwin/code.icns' },
    { src: 'icon.ico', dest: 'resources/win32/code.ico' },
  ];

  let applied = 0;
  for (const mapping of iconMappings) {
    const srcPath = path.join(iconsDir, mapping.src);
    const destPath = path.join(CODE_OSS_DIR, mapping.dest);

    if (fs.existsSync(srcPath)) {
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(srcPath, destPath);
      applied++;
    }
  }

  console.log(`   Done: ${applied} icon(s) applied`);
}

function applyDefaultSettings() {
  console.log('3. Applying default settings...');
  
  const defaultSettingsPath = path.join(
    CODE_OSS_DIR,
    'src',
    'vs',
    'workbench',
    'browser',
    'workbench.web.api.ts'
  );

  if (!fs.existsSync(defaultSettingsPath)) {
    console.log('   Skip: default settings file not found');
    return;
  }

  console.log('   Done: default settings target identified');
  console.log('   Note: Default settings will be applied via mycode-ai-main extension');
}

function applyWelcomePage() {
  console.log('4. Applying welcome page...');
  
  const welcomeDir = path.join(BRANDING_DIR, 'welcome');
  
  if (!fs.existsSync(welcomeDir)) {
    console.log('   Skip: welcome directory not found');
    return;
  }

  console.log('   Done: welcome page resources identified');
  console.log('   Note: Welcome page will be implemented as mycode-ai-main extension');
}

if (require.main === module) {
  applyBranding();
}

module.exports = { applyBranding };
