/*---------------------------------------------------------------------------------------------
 *  MyCode AI — MCP Service (ported from Void mcpService.ts)
 *  Manages MCP server lifecycle: spawn, monitor, discover tools, execute
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as cp from 'child_process';
import {
  MCPServer, MCPServerStatus, MCPTool, MCPConfigFileJSON,
  MCPConfigFileEntryJSON, MCPToolCallParams, RawMCPToolCall,
  ToolDefinition,
} from '../../shared/types';
import { getToolsService } from '../tools/toolsService';

// ============================================================
// MCPService
// ============================================================

export class MCPService {
  private _servers: Map<string, { config: MCPConfigFileEntryJSON; process?: cp.ChildProcess; status: MCPServerStatus; tools: MCPTool[] }> = new Map();
  private _disposables: vscode.Disposable[] = [];

  constructor() {}

  // --- Config ---

  /** Load MCP config from workspace settings */
  loadConfig(config: MCPConfigFileJSON): void {
    for (const [name, entry] of Object.entries(config.mcpServers)) {
      this._servers.set(name, { config: entry, status: 'offline', tools: [] });
    }
  }

  /** Add a single server from config */
  addServer(name: string, entry: MCPConfigFileEntryJSON): void {
    this._servers.set(name, { config: entry, status: 'offline', tools: [] });
  }

  /** Remove a server */
  removeServer(name: string): void {
    this.stopServer(name);
    this._servers.delete(name);
    getToolsService().unregisterMCPServer(name);
  }

  // --- Lifecycle ---

  /** Start a named MCP server */
  async startServer(name: string): Promise<void> {
    const entry = this._servers.get(name);
    if (!entry) throw new Error(`MCP server not found: ${name}`);

    entry.status = 'loading';

    try {
      if (entry.config.url) {
        // HTTP-based MCP server
        await this._connectHttpServer(name, entry);
      } else if (entry.config.command) {
        // Process-based MCP server
        await this._spawnProcessServer(name, entry);
      } else {
        throw new Error(`No command or URL configured for ${name}`);
      }

      entry.status = 'success';
    } catch (e) {
      entry.status = 'error';
      vscode.window.showErrorMessage(`MCP server ${name} failed: ${e}`);
    }
  }

  /** Stop a named MCP server */
  stopServer(name: string): void {
    const entry = this._servers.get(name);
    if (!entry) return;

    if (entry.process) {
      entry.process.kill();
      entry.process = undefined;
    }
    entry.status = 'offline';
    getToolsService().unregisterMCPServer(name);
  }

  /** Start all configured servers */
  async startAll(): Promise<void> {
    const names = Array.from(this._servers.keys());
    await Promise.allSettled(names.map(n => this.startServer(n)));
  }

  /** Stop all servers */
  stopAll(): void {
    for (const name of this._servers.keys()) {
      this.stopServer(name);
    }
  }

  // --- Tool Discovery ---

  /** Get all MCP tools from a server */
  getServerTools(name: string): MCPTool[] {
    return this._servers.get(name)?.tools ?? [];
  }

  /** Get all tools across all servers */
  getAllMCPTools(): MCPTool[] {
    const all: MCPTool[] = [];
    for (const [, entry] of this._servers) {
      all.push(...entry.tools);
    }
    return all;
  }

  // --- Tool Execution ---

  /** Execute an MCP tool and return its result */
  async executeTool(params: MCPToolCallParams): Promise<string> {
    const entry = this._servers.get(params.serverName);
    if (!entry || entry.status !== 'success') {
      throw new Error(`MCP server ${params.serverName} is not running`);
    }

    if (entry.process) {
      return this._executeViaProcess(entry, params);
    }

    throw new Error(`Unsupported MCP transport for ${params.serverName}`);
  }

  // --- Status ---

  /** Get status snapshot for all servers */
  getServerStatuses(): MCPServer[] {
    return Array.from(this._servers.entries()).map(([name, entry]) => ({
      status: entry.status,
      tools: entry.tools,
      command: entry.config.command || entry.config.url,
    }));
  }

  // --- Internal ---

  private async _connectHttpServer(name: string, entry: { config: MCPConfigFileEntryJSON; status: MCPServerStatus; tools: MCPTool[] }): Promise<void> {
    // Simplified: fetch tools list from HTTP endpoint
    const url = entry.config.url!;
    try {
      const resp = await fetch(`${url}/tools/list`, {
        headers: { 'Content-Type': 'application/json', ...(entry.config.headers || {}) },
      });
      if (resp.ok) {
        const data = await resp.json() as { tools: MCPTool[] };
        entry.tools = data.tools || [];
        this._registerTools(name, entry.tools);
      }
    } catch (e) {
      throw new Error(`HTTP MCP server ${name} unreachable: ${e}`);
    }
  }

  private async _spawnProcessServer(name: string, entry: { config: MCPConfigFileEntryJSON; process?: cp.ChildProcess; status: MCPServerStatus; tools: MCPTool[] }): Promise<void> {
    const { command, args, env } = entry.config;
    const proc = cp.spawn(command!, args || [], {
      env: { ...process.env, ...(env || {}) },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    entry.process = proc;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        proc.kill();
        reject(new Error(`MCP server ${name} startup timeout`));
      }, 15000);

      let buffer = '';

      proc.stdout?.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        // Parse JSON-RPC messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          try {
            const msg = JSON.parse(line);
            if (msg.result?.tools) {
              entry.tools = msg.result.tools;
              this._registerTools(name, entry.tools);
              clearTimeout(timeout);
              resolve();
            }
          } catch { /* partial JSON, continue */ }
        }
      });

      proc.stderr?.on('data', (chunk: Buffer) => {
        console.error(`[MCP ${name}] ${chunk.toString()}`);
      });

      proc.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      proc.on('exit', (code) => {
        if (code !== 0) {
          entry.status = 'error';
        }
      });

      // Send initialize request
      const initMsg = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { protocolVersion: '2024-11-05', capabilities: {} },
      });
      proc.stdin?.write(initMsg + '\n');

      // Request tools list
      const toolsMsg = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      });
      proc.stdin?.write(toolsMsg + '\n');
    });
  }

  private async _executeViaProcess(entry: { process?: cp.ChildProcess; config: MCPConfigFileEntryJSON }, params: MCPToolCallParams): Promise<string> {
    const proc = entry.process;
    if (!proc) throw new Error('MCP process not running');

    return new Promise((resolve, reject) => {
      const callMsg = JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name: params.toolName, arguments: params.params },
      });

      let buffer = '';
      const onData = (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          try {
            const msg = JSON.parse(line);
            if (msg.result !== undefined) {
              proc.stdout?.removeListener('data', onData);
              resolve(typeof msg.result === 'string' ? msg.result : JSON.stringify(msg.result));
            } else if (msg.error) {
              proc.stdout?.removeListener('data', onData);
              reject(new Error(msg.error.message || 'MCP tool error'));
            }
          } catch { /* continue */ }
        }
      };

      proc.stdout?.on('data', onData);
      proc.stdin?.write(callMsg + '\n');

      setTimeout(() => {
        proc.stdout?.removeListener('data', onData);
        reject(new Error('MCP tool call timeout'));
      }, 30000);
    });
  }

  private _registerTools(serverName: string, tools: MCPTool[]): void {
    const ts = getToolsService();
    for (const tool of tools) {
      const def: ToolDefinition = {
        name: `mcp:${serverName}:${tool.name}`,
        description: tool.description || `MCP tool: ${tool.name}`,
        params: Object.fromEntries(
          Object.entries(tool.inputSchema?.properties || {}).map(([k, v]: [string, any]) => [
            k,
            { type: v.type || 'string', description: v.description || '' },
          ])
        ),
        approvalType: 'MCP tools',
        execute: async (toolParams: Record<string, unknown>) => {
          return ts.executeToolRaw(`mcp:${serverName}:${tool.name}`, toolParams);
        },
      };
      ts.registerMCPTool(serverName, def);
    }
  }

  dispose(): void {
    this.stopAll();
    this._disposables.forEach(d => d.dispose());
  }
}

// Singleton
let _instance: MCPService | undefined;

export function getMCPService(): MCPService {
  if (!_instance) _instance = new MCPService();
  return _instance;
}
