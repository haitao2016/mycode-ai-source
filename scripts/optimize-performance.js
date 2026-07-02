const fs = require('fs');
const path = require('path');

const EXTENSIONS_DIR = path.join(__dirname, '..', 'extensions');

const ACTIVATION_STRATEGIES = {
  'mycode-ai-main': {
    events: ['*'],
    priority: 'high'
  },
  'mycode-ai-chat': {
    events: ['onCommand:mycode-ai-chat.open', 'onView:mycode-ai-chat.view'],
    priority: 'normal'
  },
  'mycode-ai-agent': {
    events: ['onCommand:mycode-ai-agent.start', 'onView:mycode-ai-agent.view'],
    priority: 'normal'
  },
  'mycode-ai-completion': {
    events: ['onLanguage:*'],
    priority: 'normal'
  },
  'mycode-ai-review': {
    events: ['onCommand:mycode-ai-review.analyze', 'onCommand:mycode-ai-review.panel'],
    priority: 'low'
  },
  'mycode-ai-search': {
    events: ['onCommand:mycode-ai-search.search'],
    priority: 'low'
  },
  'mycode-ai-refactor': {
    events: ['onLanguage:*'],
    priority: 'low'
  },
  'mycode-ai-debug': {
    events: ['onDebug'],
    priority: 'low'
  },
  'mycode-ai-theme': {
    events: ['*'],
    priority: 'high'
  }
};

const PERFORMANCE_CONFIG = {
  startup: {
    coldStartTargetMs: 3000,
    warmStartTargetMs: 1000,
    extensionActivationTimeoutMs: 200
  },
  memory: {
    idleTargetMB: 500,
    cacheMaxSizeMB: 100
  },
  completion: {
    latencyTargetMs: 100,
    debounceMs: 300,
    cacheSize: 50
  },
  chat: {
    firstTokenTargetMs: 2000,
    streamBufferSize: 1024
  }
};

function optimizeActivationEvents() {
  console.log('🔧 Optimizing extension activation strategies...\n');
  
  const extensions = fs.readdirSync(EXTENSIONS_DIR);
  let optimized = 0;
  
  for (const extName of extensions) {
    const pkgPath = path.join(EXTENSIONS_DIR, extName, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    
    const strategy = ACTIVATION_STRATEGIES[extName];
    if (!strategy) continue;
    
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const originalEvents = pkg.activationEvents || [];
    const optimizedEvents = strategy.events;
    
    if (JSON.stringify(originalEvents.sort()) !== JSON.stringify(optimizedEvents.sort())) {
      pkg.activationEvents = optimizedEvents;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`  ✓ ${extName}: ${originalEvents.length} → ${optimizedEvents.length} events`);
      optimized++;
    } else {
      console.log(`  - ${extName}: already optimized`);
    }
  }
  
  console.log(`\n✅ Optimized ${optimized} extensions\n`);
}

function generatePerformanceConfig() {
  const configPath = path.join(__dirname, '..', 'branding', 'performance-config.json');
  fs.writeFileSync(configPath, JSON.stringify(PERFORMANCE_CONFIG, null, 2) + '\n');
  console.log('📊 Performance config generated');
}

function generateExtensionBundleReport() {
  const extensions = fs.readdirSync(EXTENSIONS_DIR);
  const report = {
    generatedAt: new Date().toISOString(),
    totalExtensions: 0,
    extensions: []
  };
  
  for (const extName of extensions) {
    const pkgPath = path.join(EXTENSIONS_DIR, extName, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const extDir = path.join(EXTENSIONS_DIR, extName);
    
    let size = 0;
    const outDir = path.join(extDir, 'out');
    if (fs.existsSync(outDir)) {
      size = calculateDirSize(outDir);
    }
    
    report.extensions.push({
      name: pkg.name,
      displayName: pkg.displayName,
      version: pkg.version,
      sizeKB: Math.round(size / 1024),
      activationEvents: pkg.activationEvents?.length || 0,
      contributes: Object.keys(pkg.contributes || {}).length,
      dependencies: Object.keys(pkg.dependencies || {}).length
    });
    report.totalExtensions++;
  }
  
  const reportPath = path.join(__dirname, '..', 'dist', 'extension-bundle-report.json');
  const distDir = path.dirname(reportPath);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('📦 Extension bundle report generated');
  
  return report;
}

function calculateDirSize(dir) {
  let total = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += calculateDirSize(fullPath);
    } else {
      total += fs.statSync(fullPath).size;
    }
  }
  
  return total;
}

function main() {
  console.log('⚡ MyCode-AI Performance Optimization');
  console.log('=' .repeat(50));
  
  optimizeActivationEvents();
  generatePerformanceConfig();
  const report = generateExtensionBundleReport();
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Total extensions: ${report.totalExtensions}`);
  const totalSize = report.extensions.reduce((sum, e) => sum + e.sizeKB, 0);
  console.log(`📦 Total size: ${totalSize} KB`);
  console.log(`\n✅ Performance optimization complete!`);
}

main();
