/*---------------------------------------------------------------------------------------------
 *  MyCode AI — Shared Types (ported from Void voidSettingsTypes.ts + toolsServiceTypes.ts + mcpServiceTypes.ts)
 *  17 AI providers, ChatMode, 16 tool names, MCP types, Checkpoint, ToolMessage
 *--------------------------------------------------------------------------------------------*/

// ============================================================
// Provider Types (from Void voidSettingsTypes.ts)
// ============================================================

export type ProviderName =
  | 'anthropic' | 'openAI' | 'deepseek' | 'gemini' | 'xAI' | 'mistral'
  | 'ollama' | 'vLLM' | 'lmStudio' | 'liteLLM'
  | 'openRouter' | 'openAICompatible' | 'groq'
  | 'googleVertex' | 'microsoftAzure' | 'awsBedrock';

export const providerNames: ProviderName[] = [
  'anthropic', 'openAI', 'deepseek', 'gemini', 'xAI', 'mistral',
  'ollama', 'vLLM', 'lmStudio', 'liteLLM',
  'openRouter', 'openAICompatible', 'groq',
  'googleVertex', 'microsoftAzure', 'awsBedrock',
];

export const localProviderNames: ProviderName[] = ['ollama', 'vLLM', 'lmStudio'];

export interface ProviderModel {
  id: string;
  name: string;
  contextWindow?: number;
  pricing?: { input: number; output: number; cache_read?: number; cache_write?: number };
}

export type ProviderFormat = 'openai' | 'claude' | 'gemini';
export type ProviderCategory = 'oauth' | 'apikey' | 'free' | 'local';

export interface ProviderRegistry {
  id: string;
  name: string;
  alias?: string;
  baseUrl: string;
  format: ProviderFormat;
  category: ProviderCategory;
  models: ProviderModel[];
}

// ============================================================
// Chat Modes
// ============================================================

export type ChatMode = 'normal' | 'gather' | 'agent';

export const featureNames = ['Chat', 'Ctrl+K', 'Autocomplete', 'Apply', 'SCM'] as const;
export type FeatureName = (typeof featureNames)[number];

export interface ModelSelection {
  providerName: ProviderName;
  modelName: string;
}

export type ModelSelectionOfFeature = Record<FeatureName, ModelSelection | null>;

// ============================================================
// Tool Names (from Void toolsServiceTypes.ts)
// ============================================================

export const builtinToolNamesConst = [
  'read_file',
  'ls_dir',
  'get_dir_tree',
  'search_pathnames_only',
  'search_for_files',
  'search_in_file',
  'read_lint_errors',
  'rewrite_file',
  'edit_file',
  'create_file_or_folder',
  'delete_file_or_folder',
  'run_command',
  'open_persistent_terminal',
  'run_persistent_command',
  'kill_persistent_terminal',
] as const;

export type BuiltinToolName = (typeof builtinToolNamesConst)[number];

export type ToolApprovalType = 'edits' | 'terminal' | 'MCP tools';

export const approvalTypeOfBuiltinToolName: Partial<Record<BuiltinToolName, ToolApprovalType>> = {
  create_file_or_folder: 'edits',
  delete_file_or_folder: 'edits',
  rewrite_file: 'edits',
  edit_file: 'edits',
  run_command: 'terminal',
  run_persistent_command: 'terminal',
  open_persistent_terminal: 'terminal',
  kill_persistent_terminal: 'terminal',
};

// ============================================================
// MCP Types (from Void mcpServiceTypes.ts)
// ============================================================

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
}

export interface MCPConfigFileEntryJSON {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
}

export interface MCPConfigFileJSON {
  mcpServers: Record<string, MCPConfigFileEntryJSON>;
}

export type MCPServerStatus = 'loading' | 'success' | 'offline' | 'error';

export interface MCPServer {
  tools?: MCPTool[];
  status: MCPServerStatus;
  command?: string;
  error?: string;
}

export interface MCPServerOfName {
  [serverName: string]: MCPServer;
}

export interface MCPToolCallParams {
  serverName: string;
  toolName: string;
  params: Record<string, unknown>;
}

export type RawMCPToolCall =
  | { event: 'text'; toolName: string; serverName?: string; text: string }
  | { event: 'error'; toolName: string; serverName?: string; text: string }
  | { event: 'image'; toolName: string; serverName?: string; image: { data: string; mimeType: string } }
  | { event: 'audio'; toolName: string; serverName?: string }
  | { event: 'resource'; toolName: string; serverName?: string };

// ============================================================
// Internal Tool Info (for prompts)
// ============================================================

export interface InternalToolInfo {
  name: string;
  description: string;
  params: { [paramName: string]: { description: string } };
  mcpServerName?: string;
}

// ============================================================
// Checkpoint & Tool Message
// ============================================================

export interface Checkpoint {
  id: string;
  timestamp: number;
  description: string;
  fileSnapshots: Map<string, string>;
}

export interface ToolMessage {
  toolName: string;
  params: Record<string, unknown>;
  result: string;
  timestamp: number;
}

// ============================================================
// AI Message Types (from existing)
// ============================================================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AgentTask {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: Array<{ action: string; result: string; timestamp: number }>;
}

export interface ReviewIssue {
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

export interface AgentTool {
  name: string;
  description: string;
  execute: (...args: unknown[]) => Promise<string>;
}

// ============================================================
// Model Capabilities (for modelCapabilities.ts)
// ============================================================

export interface ModelCapabilities {
  supportsImages?: boolean;
  supportsComputerUse?: boolean;
  supportsPromptCaching?: boolean;
  maxOutputTokens?: number;
}

// ============================================================
// Tool Definition / Call / Result (for toolsService & builtinTools)
// ============================================================

export interface ToolDefinition {
  name: string;
  description: string;
  params: Record<string, { type: string; description: string; required?: boolean }>;
  execute: (params: Record<string, unknown>) => Promise<string>;
  approvalType?: ToolApprovalType;
}

export interface ToolCall {
  toolName: string;
  params: Record<string, unknown>;
  id?: string;
}

export interface ToolResult {
  toolName: string;
  result: string;
  error?: string;
  id?: string;
}

// Re-export aliases for case-insensitive imports
export type McpServer = MCPServer;
export type McpTool = MCPTool;
export type McpConfig = MCPConfigFileJSON;
export type McpConfigEntry = MCPConfigFileEntryJSON;

// ============================================================
// Chat Context (for agent/chat contributions)
// ============================================================

export interface ChatContext {
  workspaceRoot?: string;
  activeFile?: string;
  selectedText?: string;
  language?: string;
}
