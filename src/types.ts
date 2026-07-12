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