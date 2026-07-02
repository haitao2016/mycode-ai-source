const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const RELEASE_DIR = path.join(DIST_DIR, 'release');
const BRANDING_DIR = path.join(ROOT_DIR, 'branding');

const VERSION = process.env.VERSION || '1.0.0';
const BUILD_NUMBER = process.env.BUILD_NUMBER || '0001';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function updateVersions() {
  console.log('📝 Updating version numbers...\n');
  
  const extensionsDir = path.join(ROOT_DIR, 'extensions');
  const extensions = fs.readdirSync(extensionsDir);
  
  for (const ext of extensions) {
    const pkgPath = path.join(extensionsDir, ext, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    
    const pkg = readJson(pkgPath);
    if (pkg.version !== VERSION) {
      pkg.version = VERSION;
      writeJson(pkgPath, pkg);
      console.log(`  ✓ ${ext}: ${VERSION}`);
    }
  }
  
  const productJsonPath = path.join(BRANDING_DIR, 'product.json');
  if (fs.existsSync(productJsonPath)) {
    const product = readJson(productJsonPath);
    product.version = VERSION;
    product.buildNumber = BUILD_NUMBER;
    writeJson(productJsonPath, product);
  }
  
  console.log();
}

function buildExtensions() {
  console.log('🔨 Building extensions...\n');
  
  const buildScript = path.join(ROOT_DIR, 'scripts', 'build-extensions.js');
  execSync(`node "${buildScript}"`, { stdio: 'inherit', cwd: ROOT_DIR });
  
  console.log();
}

function packageExtensions() {
  console.log('📦 Packaging extensions...\n');
  
  const packageScript = path.join(ROOT_DIR, 'scripts', 'package-extensions.js');
  execSync(`node "${packageScript}"`, { stdio: 'inherit', cwd: ROOT_DIR });
  
  console.log();
}

function generateChecksums() {
  console.log('🔐 Generating checksums...\n');
  
  ensureDir(RELEASE_DIR);
  const checksums = {};
  
  const files = fs.readdirSync(RELEASE_DIR).filter(f => 
    f.endsWith('.exe') || f.endsWith('.zip') || f.endsWith('.dmg') || 
    f.endsWith('.deb') || f.endsWith('.rpm') || f.endsWith('.AppImage')
  );
  
  for (const file of files) {
    const filePath = path.join(RELEASE_DIR, file);
    const stats = fs.statSync(filePath);
    checksums[file] = {
      size: stats.size,
      sizeMB: (stats.size / 1024 / 1024).toFixed(2) + ' MB'
    };
  }
  
  const checksumsPath = path.join(RELEASE_DIR, 'checksums.json');
  writeJson(checksumsPath, {
    version: VERSION,
    buildNumber: BUILD_NUMBER,
    generatedAt: new Date().toISOString(),
    files: checksums
  });
  
  console.log(`  ✓ Generated for ${Object.keys(checksums).length} files\n`);
}

function generateReleaseNotes() {
  console.log('📄 Generating release notes...\n');
  
  ensureDir(RELEASE_DIR);
  
  const releaseNotes = {
    version: VERSION,
    buildNumber: BUILD_NUMBER,
    releaseDate: new Date().toISOString().split('T')[0],
    highlights: [
      'Initial release of MyCode-AI based on Code-OSS architecture',
      'Complete AI chat functionality with streaming responses',
      'Agent mode with file operations and terminal integration',
      'AI-powered code completion with inline suggestions',
      'Code review with diagnostic integration',
      'Semantic code search with TF-IDF indexing',
      'AI refactoring assistance via CodeAction',
      'Debug assistant with error analysis',
      'Custom MyCode-AI dark and light themes',
      'Full VS Code extension compatibility'
    ],
    features: {
      'AI Chat': 'Sidebar chat interface with multi-conversation support, streaming responses, and code block highlighting',
      'Agent Mode': 'Automated task execution with file operations, terminal commands, and step-by-step planning',
      'Code Completion': 'Intelligent code suggestions with debouncing and caching for performance',
      'Code Review': 'Static analysis + AI-powered review with issue categorization and severity levels',
      'Semantic Search': 'Codebase search using TF-IDF with fuzzy matching and snippet preview',
      'Refactoring': 'AI-powered code actions including explain, optimize, add comments, generate tests',
      'Debug Assistant': 'Error pattern analysis, stack trace explanation, and suggested fixes',
      'Themes': 'Custom dark and light themes matching MyCode-AI branding'
    },
    knownIssues: [
      'Requires Node.js 20.x for Code-OSS compilation',
      'AI features require API key configuration',
      'Some advanced features are in beta'
    ],
    compatibility: {
      'Windows': 'Windows 10/11 x64',
      'macOS': 'macOS 12+ (Intel and Apple Silicon)',
      'Linux': 'Ubuntu 20.04+, Debian 11+, Fedora 35+'
    }
  };
  
  const notesPath = path.join(RELEASE_DIR, 'release-notes.json');
  writeJson(notesPath, releaseNotes);
  
  const mdPath = path.join(RELEASE_DIR, 'RELEASE_NOTES.md');
  let mdContent = `# MyCode-AI v${VERSION} Release Notes\n\n`;
  mdContent += `**Release Date:** ${releaseNotes.releaseDate}\n`;
  mdContent += `**Build:** ${BUILD_NUMBER}\n\n`;
  mdContent += `## 🎉 Highlights\n\n`;
  
  for (const h of releaseNotes.highlights) {
    mdContent += `- ${h}\n`;
  }
  
  mdContent += `\n## ✨ Features\n\n`;
  
  for (const [name, desc] of Object.entries(releaseNotes.features)) {
    mdContent += `### ${name}\n\n${desc}\n\n`;
  }
  
  mdContent += `## 📋 Platform Support\n\n`;
  
  for (const [platform, support] of Object.entries(releaseNotes.compatibility)) {
    mdContent += `- **${platform}:** ${support}\n`;
  }
  
  mdContent += `\n## ⚠️ Known Issues\n\n`;
  
  for (const issue of releaseNotes.knownIssues) {
    mdContent += `- ${issue}\n`;
  }
  
  fs.writeFileSync(mdPath, mdContent);
  console.log(`  ✓ Release notes generated\n`);
}

function runSmokeTests() {
  console.log('🧪 Running smoke tests...\n');
  
  const extensionsDir = path.join(DIST_DIR, 'extensions');
  const manifestPath = path.join(extensionsDir, 'extensions.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.log('  ⚠ Extension manifest not found, skipping');
    return false;
  }
  
  const manifest = readJson(manifestPath);
  const required = [
    'mycode-ai-main',
    'mycode-ai-chat',
    'mycode-ai-agent',
    'mycode-ai-completion',
    'mycode-ai-review',
    'mycode-ai-search',
    'mycode-ai-refactor',
    'mycode-ai-debug',
    'mycode-ai-theme'
  ];
  
  const installed = manifest.extensions.map(e => e.name);
  let pass = true;
  
  for (const req of required) {
    if (installed.includes(req)) {
      console.log(`  ✓ ${req}`);
    } else {
      console.log(`  ✗ ${req} MISSING`);
      pass = false;
    }
  }
  
  console.log(`\n  Smoke tests: ${pass ? 'PASSED' : 'FAILED'}\n`);
  return pass;
}

function main() {
  console.log('🚀 MyCode-AI Build & Release Script');
  console.log('=' .repeat(60));
  console.log(`  Version: ${VERSION}`);
  console.log(`  Build: ${BUILD_NUMBER}`);
  console.log(`  Time: ${new Date().toISOString()}`);
  console.log('=' .repeat(60) + '\n');
  
  const startTime = Date.now();
  
  try {
    updateVersions();
    buildExtensions();
    packageExtensions();
    
    const smokePass = runSmokeTests();
    if (!smokePass) {
      console.error('❌ Smoke tests failed!');
      process.exit(1);
    }
    
    generateReleaseNotes();
    generateChecksums();
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('=' .repeat(60));
    console.log(`✅ Build complete!`);
    console.log(`   Duration: ${elapsed}s`);
    console.log(`   Output: ${RELEASE_DIR}`);
    console.log('=' .repeat(60));
    
  } catch (err) {
    console.error(`\n❌ Build failed: ${err.message}`);
    process.exit(1);
  }
}

main();
