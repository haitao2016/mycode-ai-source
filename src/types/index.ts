/**
 * 文件/目录项类型定义
 */
export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileItem[];
}

/**
 * AI 消息角色类型
 */
export type AIMessageRole = 'user' | 'assistant';

/**
 * AI 消息类型定义
 */
export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: number;
}

/**
 * AI 模型类型 - 支持所有提供商
 */
export type AIModelType = string;

/**
 * AI 配置类型定义
 */
export interface AIConfig {
  model: AIModelType;
  apiKey: string;
  baseUrl: string;
  modelName: string;
}

/**
 * AI 响应结果类型
 */
export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface ReadDirectoryResult {
  success: boolean;
  data?: FileItem[];
  error?: string;
}

/**
 * 编辑器状态类型定义
 */
export interface EditorState {
  currentFile: string | null;
  content: string;
  language: string;
}

/** 平台类型 */
export type Platform = 'pc' | 'mobile' | 'tablet' | 'webgl' | 'android' | 'ios' | 'web';

/** 项目引擎类型 */
export type EngineType = 'unity' | 'cocos' | 'laya' | 'native-js' | 'custom';

/** 项目状态 */
export type ProjectStatus = 'idle' | 'building' | 'debugging' | 'running' | 'error';

/** TapTap 小游戏项目配置 */
export interface TapProjectConfig {
  id: string;
  name: string;
  description?: string;
  engine: EngineType;
  unityVersion?: string;
  appId?: string;
  clientId?: string;
  buildPath: string;
  cdnUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** 项目元数据 */
export interface ProjectMeta {
  config: TapProjectConfig;
  path: string;
  status: ProjectStatus;
  lastOpenedAt?: string;
  name: string;
}

/** 编辑器文件节点 */
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  extension?: string;
}

/** 打开的文件标签 */
export interface EditorTab {
  id: string;
  path: string;
  name: string;
  content: string;
  language: string;
  modified: boolean;
  cursorPosition?: { line: number; column: number };
}

/** 日志级别 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** 调试日志条目 */
export interface DebugLogEntry {
  id: string;
  level: LogLevel;
  message: string;
  source?: string;
  timestamp: number;
  data?: unknown;
}

/** 断点信息 */
export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  enabled: boolean;
  condition?: string;
}

/** 调试会话状态 */
export interface DebugSession {
  id: string;
  projectId: string;
  status: 'connected' | 'disconnected' | 'paused' | 'running';
  breakpoints: Breakpoint[];
  logs: DebugLogEntry[];
  serverPort?: number;
  qrCodeUrl?: string;
  wsUrl?: string;
  gameConnected?: boolean;
  qrCodeDataUrl?: string;
}

/** 网络请求信息 */
export interface NetworkRequestInfo {
  id: string;
  url: string;
  method: string;
  status: number;
  duration: number;
  size: number;
  timestamp: number;
  type: 'fetch' | 'xhr' | 'websocket';
}

/** 性能指标 */
export interface PerformanceMetrics {
  fps: number;
  memory: number;
  memoryLimit: number;
  drawCalls?: number;
  triangles?: number;
  networkRequests: number;
  networkLatency?: number;
  loadTime?: number;
  cpuUsage?: number;
  gpuMemory?: number;
  frameTime?: number;
  timestamp: number;
}

/** 监控告警 */
export interface MonitorAlert {
  id: string;
  type: 'fps' | 'memory' | 'network' | 'error' | 'cpu' | 'gpu';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

/** 监控统计 */
export interface MonitorStats {
  avgFps: number;
  avgMemoryUsage: number;
  totalRequests: number;
  failedRequests: number;
  avgLatency: number;
  uptime: number;
}

/** 监控阈值 */
export interface MonitorThresholds {
  fps: number;
  memoryRatio: number;
  cpuUsage: number;
  networkLatency: number;
  requestTimeout: number;
}

/** 构建配置 */
export interface BuildConfig {
  projectId: string;
  projectPath: string;
  outputPath: string;
  compress: boolean;
  wasmSplit: boolean;
  development: boolean;
  targetPlatform: Platform[];
  cdnUrl?: string;
  version: string;
  unityPath?: string;
  appId?: string;
  optimizeAssets?: boolean;
  stripDebugInfo?: boolean;
  enableWebAssembly?: boolean;
  wasmMemorySize?: number;
  customDefines?: string[];
  androidKeystorePath?: string;
  androidKeystoreAlias?: string;
  iosTeamId?: string;
  iosBundleId?: string;
  useCache?: boolean;
}

/** 构建结果 */
export interface BuildResult {
  id: string;
  projectId: string;
  success: boolean;
  outputFiles: string[];
  duration: number;
  errors: string[];
  warnings: string[];
  timestamp: number;
  buildNumber?: string;
  buildHash?: string;
  cacheInfo?: BuildCacheInfo;
}

/** 构建任务状态 */
export type BuildTaskStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

/** 构建缓存信息 */
export interface BuildCacheInfo {
  enabled: boolean;
  hit: boolean;
  cachedAt?: number;
  cacheKey?: string;
  hash?: string;
  lastModified?: number;
  valid?: boolean;
  skippedSteps?: string[];
  hitCount?: number;
}

/** 构建任务 */
export interface BuildTask {
  id: string;
  config: BuildConfig;
  status: BuildTaskStatus;
  progress: number;
  progressMessage?: string;
  result?: BuildResult;
  startedAt?: number;
  finishedAt?: number;
  cacheInfo?: BuildCacheInfo;
}

/** 构建步骤 */
export interface BuildStep {
  name: string;
  weight?: number;
  message?: string;
  completed?: boolean;
  status?: 'pending' | 'running' | 'success' | 'failed';
  error?: string;
  detail?: string;
  cacheable?: boolean;
}

/** 构建平台配置 */
export interface BuildPlatformConfig {
  platform: Platform;
  supported: boolean;
  buildCommand: string;
  outputExtension: string;
  requiresNative?: boolean;
}

// Plugin Hooks
export type PluginHook =
  | 'onProjectOpen'
  | 'onProjectClose'
  | 'onBuildStart'
  | 'onBuildComplete'
  | 'onDebugConnect'
  | 'onDebugDisconnect'
  | 'onMonitorTick'
  | 'onBeforeSave'
  | 'onAfterSave';

// Extension Points
export type ExtensionPoint =
  | 'editor:toolbar'
  | 'editor:context-menu'
  | 'editor:status-bar'
  | 'editor:panel'
  | 'editor:command'
  | 'editor:language'
  | 'editor:theme'
  | 'editor:webview'
  | 'build:task'
  | 'build:target'
  | 'debug:adapter'
  | 'project:template'
  | 'asset:importer'
  | 'asset:exporter'
  | 'ai:provider'
  | 'cloud:sync';

// Plugin Metadata
export interface PluginMeta {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  enabled: boolean;
  entry: string;
  hooks: PluginHook[];
  icon?: string;
  category?: string;
  homepage?: string;
  repository?: string;
}

// Plugin Manifest
export interface PluginManifest {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  author: string;
  publisher: string;
  license: string;
  icon?: string;
  homepage?: string;
  repository?: string;
  engines: { tapdev: string; node?: string };
  main: string;
  contributes: PluginContribution[];
  dependencies: Record<string, string>;
  activationEvents: string[];
  categories: string[];
  keywords: string[];
}

// Plugin Contribution
export interface PluginContribution {
  point: ExtensionPoint;
  command?: {
    command: string;
    title: string;
    category?: string;
    icon?: string;
    shortcut?: string;
  };
  menu?: { location: string; command: string; group?: string; when?: string };
  panel?: {
    id: string;
    title: string;
    icon?: string;
    location?: string;
  };
  language?: {
    id: string;
    extensions: string[];
    aliases?: string[];
  };
  theme?: {
    id: string;
    label: string;
    type: 'light' | 'dark';
    path: string;
  };
}

// Panel & Command Config
export interface PanelConfig {
  id: string;
  title: string;
  icon?: string;
  component: string;
  defaultPosition?: 'left' | 'right' | 'bottom' | 'center';
  defaultSize?: number;
}

export interface CommandConfig {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category?: string;
  enabled?: boolean;
}

export interface PluginAction {
  id: string;
  type: 'command' | 'menu' | 'button';
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  handler: () => void | Promise<void>;
}

// Plugin Context
export interface PluginContext {
  project?: ProjectMeta;
  emit: (event: string, data?: unknown) => void;
  registerCommand: (
    id: string,
    handler: () => void | Promise<void>,
    config?: CommandConfig
  ) => void;
  registerPanel: (id: string, config: PanelConfig) => void;
  registerAction: (action: PluginAction) => void;
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  openUrl: (url: string) => void;
}

// Plugin Info
export interface PluginInfo {
  meta: PluginMeta;
  commands: CommandConfig[];
  panels: PanelConfig[];
  actions: PluginAction[];
  activated: boolean;
}

// Command Palette
export interface CommandPaletteItem {
  id: string;
  pluginId: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  shortcut?: string;
  action: () => void | Promise<void>;
}

// Plugin Marketplace
export interface PluginListing {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  author: PluginPublisher;
  icon?: string;
  screenshots?: string[];
  rating: number;
  downloadCount: number;
  categories: string[];
  tags: string[];
  readme?: string;
  changelog?: string;
  lastUpdated: number;
  pricing: 'free' | 'paid' | 'subscription';
  price?: number;
}

export interface PluginPublisher {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  website?: string;
}

// Plugin Security
export interface PluginPermissions {
  fileSystem: 'none' | 'read' | 'write' | 'full';
  network: 'none' | 'localhost' | 'all';
  process: 'none' | 'spawn' | 'exec';
  shell: boolean;
  env: string[];
}

export interface PluginSandboxConfig {
  enabled: boolean;
  permissions: PluginPermissions;
  resourceLimits?: {
    maxMemory?: number;
    maxCpu?: number;
    maxNetwork?: number;
  };
}

export type AIProvider = 
  | 'openai' 
  | 'claude' 
  | 'ollama' 
  | 'mock' 
  | 'local'
  | 'claude_code'
  | 'codex'
  | 'github'
  | 'cursor'
  | 'antigravity'
  | 'kilo'
  | 'cline'
  | 'codebuddy'
  | 'kimchi'
  | 'kiro'
  | 'mimo'
  | 'qoder'
  | 'glm'
  | 'glm_coding'
  | 'minimax'
  | 'minimax_coding'
  | 'kimi'
  | 'deepseek'
  | 'qwen'
  | 'alibaba_intl'
  | 'anthropic'
  | 'gemini'
  | 'mistral'
  | 'xai'
  | 'perplexity'
  | 'groq'
  | 'cerebras'
  | 'fireworks'
  | 'together'
  | 'openrouter'
  | 'siliconflow'
  | 'cohere'
  | 'command_code'
  | 'nvidia'
  | 'nebius'
  | 'azure'
  | 'blackbox'
  | 'chutes'
  | 'hyperbolic'
  | 'venice'
  | 'vercel'
  | 'byteplus'
  | 'volcengine'
  | 'ollama_cloud'
  | 'vertex'
  | 'vertex_partner'
  | 'opencode'
  | 'opencode_go'
  | 'gemini_cli'
  | 'cloudflare'
  | 'xiaomi_mimo'
  | 'xiaomi_mimo_token';
export type CompletionTrigger = 'auto' | 'manual' | 'on-type';
export type ChatRole = 'user' | 'assistant' | 'system' | 'tool';
export type ReferenceType =
  | 'file'
  | 'function'
  | 'class'
  | 'symbol'
  | 'error'
  | 'snippet'
  | 'selection';
export type ChatStatus = 'idle' | 'thinking' | 'streaming' | 'error';
export type CodeLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'cpp'
  | 'go'
  | 'rust'
  | 'lua'
  | 'other';
export type ErrorSeverity = 'error' | 'warning' | 'info';
export type ErrorCategory = 'syntax' | 'runtime' | 'logic' | 'performance' | 'security' | 'type';

// Completion types
export interface CompletionContext {
  filePath: string;
  language: string;
  prefix: string;
  suffix: string;
  cursor: { line: number; column: number };
  projectTypes?: string[];
  selectedText?: string;
  imports?: string[];
  symbols?: string[];
}

export interface CompletionRequest {
  id: string;
  context: CompletionContext;
  multiline: boolean;
  trigger: CompletionTrigger;
}

export interface CompletionItem {
  id: string;
  text: string;
  displayText?: string;
  description?: string;
  type?: 'function' | 'variable' | 'class' | 'keyword' | 'snippet' | 'property' | 'method';
  confidence: number;
  detail?: string;
}

export interface CompletionResult {
  id: string;
  items: CompletionItem[];
  confidence: number;
  model: string;
  provider: AIProvider;
  latency: number;
  cached?: boolean;
}

export interface LocalCompletionRule {
  id: string;
  language: string;
  pattern: RegExp;
  generate: (match: RegExpMatchArray, context: CompletionContext) => CompletionItem[];
  priority: number;
}

export interface SnippetCompletion {
  id: string;
  label: string;
  description?: string;
  body: string;
  scope: string;
  prefix: string;
}

// Chat types
export interface Reference {
  id: string;
  type: ReferenceType;
  path: string;
  line?: number;
  endLine?: number;
  label: string;
  content?: string;
  language?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  references?: Reference[];
  timestamp: number;
  status?: ChatStatus;
  thinking?: string;
  toolCalls?: ToolCall[];
  metadata?: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  prompt?: string;
  icon?: string;
  shortcut?: string;
}

export interface AIAssistantConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  contextWindow?: number;
  streaming?: boolean;
}

// Code Generation types
export interface CodeGenAction {
  type: 'create' | 'edit' | 'delete' | 'refactor';
  path: string;
  description: string;
  diff?: CodeDiff;
}

export interface CodeGenTemplate {
  id: string;
  name: string;
  description: string;
  language: CodeLanguage;
  code: string;
  variables?: Record<string, string>;
}

export interface CodeGenRequest {
  prompt: string;
  language: CodeLanguage;
  context?: {
    files?: string[];
    symbols?: string[];
    projectType?: string;
  };
  template?: CodeGenTemplate;
  stream?: boolean;
}

export interface CodeDiff {
  oldText: string;
  newText: string;
  startLine: number;
  endLine: number;
}

export interface CodeGenResult {
  success: boolean;
  actions: CodeGenAction[];
  message?: string;
  confidence?: number;
}

export interface CodeGenSuggestion {
  id: string;
  type: 'create' | 'edit' | 'refactor';
  filePath: string;
  description: string;
  code: string;
  confidence: number;
  reasoning?: string;
}

// Error Diagnosis types
export interface ErrorContext {
  filePath: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  code: string;
  language: string;
  projectType?: string;
  stack?: string;
  framework?: string;
}

export interface DiagnosisSuggestion {
  id?: string;
  type: 'fix' | 'ignore' | 'learn';
  title: string;
  description: string;
  fixes?: FixStep[];
  confidence: number;
  documentation?: string[];
  occurrences?: Array<{ line: number; column: number; match: string }>;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  ruleId?: string;
}

export interface FixStep {
  order: number;
  description: string;
  code?: string;
  file?: string;
  line?: number;
  autoFixable?: boolean;
}

export interface FixPatch {
  file: string;
  startLine: number;
  endLine: number;
  newCode: string;
  oldCode: string;
  suggestionId?: string;
}

export interface ErrorReference {
  error: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  documentation: string[];
  similarErrors: string[];
}

export interface ErrorRule {
  id?: string;
  pattern: RegExp;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  documentation: string[];
  fixSuggestion?: string;
  autoFix?: (code: string) => string;
}

// Agent types
export interface AgentTask {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority?: number;
  createdAt: number;
  updatedAt: number;
  result?: unknown;
  error?: string;
}

export interface AgentThought {
  thought: string;
  action: string;
  observation: string;
  reflection?: string;
}

export interface AgentPlan {
  steps: AgentThought[];
  currentStep: number;
  status: 'planning' | 'executing' | 'completed' | 'failed';
}

export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  prompt: string;
  systemPrompt?: string;
  tools?: string[];
  mcpServers?: string[];
  isCallable?: boolean;
  callableName?: string;
  callableDescription?: string;
  temperature?: number;
  maxTokens?: number;
  createdAt: number;
  updatedAt?: number;
  version?: string;
  author?: string;
}

export interface AgentShareData {
  config: AgentConfig;
  version: string;
  exportedAt: number;
  checksum?: string;
}

/** 通用应用事件 payload 类型 */
export interface AppEvent<TPayload = unknown> {
  type: string;
  payload: TPayload;
  timestamp?: number;
  source?: string;
}

/** 事件总线订阅者 */
export type AppEventHandler<TPayload = unknown> = (event: AppEvent<TPayload>) => void;

/** 应用主题 */
export type Theme = 'dark' | 'light' | 'auto' | 'system';

/** 应用语言 */
export type Language = 'zh-CN' | 'en-US' | 'ja-JP';

/** 应用设置 */
export interface AppSettings {
  theme: Theme;
  language: Language;
  accentColor?: string;
  uiFontSize?: number;
  compactMode?: boolean;
  animationsEnabled?: boolean;
  editorFontSize: number;
  editorTabSize: number;
  editorLineWidth: number;
  editorUseSpaces?: boolean;
  editorLineNumbers?: boolean;
  editorMinimap?: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  autoSaveInterval?: number;
  formatOnSave: boolean;
  formatOnPaste: boolean;
  debugServerPort: number;
  debugBreakOnStart: boolean;
  debugBreakOnException: boolean;
  debugInlineValues: boolean;
  buildOutputPath: string;
  defaultBuildPath: string;
  defaultCompress: boolean;
  defaultWasmSplit: boolean;
  buildNotification: boolean;
  maxBuildHistory: number;
  unityPath?: string;
  autoCheckUpdates?: boolean;
  sendTelemetry?: boolean;
  recentProjects: string[];
  enabledPlugins: string[];
  restoreLastProject?: boolean;
  maxLogLines: number;
  logTimestamps: boolean;
  autoScrollLog: boolean;
}

// Analytics & QA types
export interface PlayerEvent {
  playerId: string;
  sessionId: string;
  eventName: string;
  properties: Record<string, unknown>;
  timestamp: number;
  platform: 'android' | 'ios' | 'web' | 'desktop';
}

export interface PlayerSession {
  id: string;
  playerId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  platform: 'android' | 'ios' | 'web' | 'desktop';
  deviceInfo: {
    os: string;
    osVersion: string;
    deviceModel?: string;
    screenResolution?: string;
    networkType?: string;
  };
  events: PlayerEvent[];
}

export interface PlayerMetrics {
  dau: number;
  mau: number;
  newUsers: number;
  retainedUsers: number;
  avgSessionDuration: number;
  totalSessions: number;
  totalPlaytime: number;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  tests: TestCase[];
  status: 'draft' | 'ready' | 'running' | 'completed';
  lastRunAt?: number;
  lastRunResult?: TestSuiteResult;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  status: 'draft' | 'ready' | 'running' | 'passed' | 'failed' | 'skipped';
  steps: TestStep[];
  expectedResult: string;
  actualResult?: string;
  duration?: number;
  error?: string;
}

export interface TestStep {
  id: string;
  action: string;
  target?: string;
  value?: string;
  screenshot?: string;
}

export interface TestSuiteResult {
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: number;
}

export interface TestReport {
  suiteId: string;
  suiteName: string;
  runAt: number;
  result: TestSuiteResult;
  failedTests: TestCase[];
  screenshots: Record<string, string>;
}