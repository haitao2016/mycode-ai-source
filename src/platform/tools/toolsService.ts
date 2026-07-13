/*---------------------------------------------------------------------------------------------
 *  MyCode AI — Tools Service (ported from Void toolsService.ts)
 *  Manages built-in + MCP tools, execution, and approval
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { ToolDefinition, ToolCall, ToolResult, InternalToolInfo, BuiltinToolName } from '../../shared/types';
import { allBuiltinTools, builtinToolsByName } from './builtinTools';

// ============================================================
// ToolsService
// ============================================================

export class ToolsService {
  private _tools: Map<string, ToolDefinition> = new Map();
  private _mcpTools: Map<string, ToolDefinition> = new Map();

  constructor() {
    // Register all built-in tools
    for (const t of allBuiltinTools) {
      this._tools.set(t.name, t);
    }
  }

  // --- Registration ---

  /** Register an MCP tool (from an MCP server) */
  registerMCPTool(serverName: string, tool: ToolDefinition): void {
    const key = `mcp:${serverName}:${tool.name}`;
    this._mcpTools.set(key, tool);
    this._tools.set(key, tool);
  }

  /** Unregister all MCP tools from a server */
  unregisterMCPServer(serverName: string): void {
    const prefix = `mcp:${serverName}:`;
    for (const key of this._tools.keys()) {
      if (key.startsWith(prefix)) {
        this._tools.delete(key);
        this._mcpTools.delete(key);
      }
    }
  }

  // --- Lookup ---

  getTool(name: string): ToolDefinition | undefined {
    return this._tools.get(name);
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this._tools.values());
  }

  getBuiltinTools(): ToolDefinition[] {
    return allBuiltinTools;
  }

  getMCPTools(): ToolDefinition[] {
    return Array.from(this._mcpTools.values());
  }

  /** Get tool info for AI prompts */
  getToolInfoForPrompt(): InternalToolInfo[] {
    return this.getAllTools().map(t => ({
      name: t.name,
      description: t.description,
      params: Object.fromEntries(
        Object.entries(t.params).map(([k, v]) => [k, { description: v.description }])
      ),
    }));
  }

  // --- Execution ---

  async executeTool(call: ToolCall): Promise<ToolResult> {
    const tool = this._tools.get(call.toolName);
    if (!tool) {
      return { toolName: call.toolName, result: '', error: `Unknown tool: ${call.toolName}` };
    }

    // Check approval
    if (tool.approvalType) {
      const approved = await this._requestApproval(tool, call.params);
      if (!approved) {
        return { toolName: call.toolName, result: '', error: 'User denied tool execution' };
      }
    }

    try {
      const result = await tool.execute(call.params);
      return { toolName: call.toolName, result, id: call.id };
    } catch (e) {
      return { toolName: call.toolName, result: '', error: String(e), id: call.id };
    }
  }

  async executeToolRaw(name: string, params: Record<string, unknown>): Promise<string> {
    const tool = this._tools.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return tool.execute(params);
  }

  // --- Approval ---

  private async _requestApproval(tool: ToolDefinition, params: Record<string, unknown>): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const autoApprove = config.get<string[]>('autoApproveTools', []);

    if (autoApprove.includes(tool.name)) return true;

    const label = tool.approvalType === 'terminal'
      ? `Run: ${params.command || params.name || 'command'}`
      : `Edit: ${params.path || 'file'}`;

    const choice = await vscode.window.showWarningMessage(
      `AI wants to use tool: ${label}`,
      { modal: false },
      'Approve',
      `Approve All "${tool.name}"`,
      'Deny'
    );

    if (choice === `Approve All "${tool.name}"`) {
      const updated = [...autoApprove, tool.name];
      await config.update('autoApproveTools', updated, vscode.ConfigurationTarget.Global);
      return true;
    }

    return choice === 'Approve';
  }
}

// Singleton
let _instance: ToolsService | undefined;

export function getToolsService(): ToolsService {
  if (!_instance) _instance = new ToolsService();
  return _instance;
}
