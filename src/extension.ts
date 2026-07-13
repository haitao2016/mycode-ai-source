/*---------------------------------------------------------------------------------------------
 *  MyCode AI — Main Entry Point
 *  Modeled after VS Code's src/vs/workbench/workbench.common.main.ts
 *  Architecture: base → platform → workbench/contrib
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { DisposableStore } from './base/common/lifecycle';

// --- Workbench Contribs ---
import { ChatContribution } from './workbench/contrib/chat/chat.contribution';
import { AgentContribution } from './workbench/contrib/agent/agent.contribution';
import { CompletionContribution } from './workbench/contrib/completion/completion.contribution';
import { ReviewContribution } from './workbench/contrib/review/review.contribution';
import { DebugContribution } from './workbench/contrib/debug/debug.contribution';
import { GitContribution } from './workbench/contrib/git/git.contribution';
import { LspContribution } from './workbench/contrib/lsp/lsp.contribution';
import { TaskContribution } from './workbench/contrib/tasks/task.contribution';
import { SearchContribution } from './workbench/contrib/search/search.contribution';

// --- Platform Services ---
import { ToolsService, getToolsService } from './platform/tools/toolsService';
import { MCPService, getMCPService } from './platform/mcp/mcpService';

// --- Workbench common ---
import { IWorkbenchContribution } from './workbench/common';
import { ToolCall } from './shared/types';

const CONTRIBUTIONS: Array<new () => IWorkbenchContribution> = [
  ChatContribution, AgentContribution, CompletionContribution,
  ReviewContribution, DebugContribution, GitContribution,
  LspContribution, TaskContribution, SearchContribution,
];

let _globalStore: DisposableStore;

export async function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('mycode-ai');
  const isEnabled = config.get<boolean>('enabled', true);
  vscode.commands.executeCommand('setContext', 'mycode-ai.enabled', isEnabled);

  _globalStore = new DisposableStore();

  // --- Initialize platform services (singletons) ---
  const toolsService = getToolsService();
  _globalStore.add({ dispose: () => toolsService.dispose() });

  const mcpService = getMCPService();
  _globalStore.add({ dispose: () => mcpService.dispose() });

  // Wire MCP tools into the ToolsService
  mcpService._onDidDiscoverTools((serverName: string, tools: any[]) => {
    for (const tool of tools) {
      toolsService.registerMCPTool(serverName, tool);
    }
  });

  console.log('MyCode AI: platform services initialized (ToolsService + MCPService)');

  // --- Activate workbench contributions ---
  for (const Ctor of CONTRIBUTIONS) {
    const contrib = new Ctor();
    const store = new DisposableStore();
    try {
      await contrib.activate(store);
    } catch (e) {
      console.error(`Failed to activate contribution: ${Ctor.name}`, e);
    }
    _globalStore.add(store);
  }

  // --- Commands ---
  _globalStore.add(vscode.commands.registerCommand('mycode-ai.toggle', async () => {
    const cfg = vscode.workspace.getConfiguration('mycode-ai');
    const cur = cfg.get<boolean>('enabled', true);
    await cfg.update('enabled', !cur, true);
    vscode.commands.executeCommand('setContext', 'mycode-ai.enabled', !cur);
    vscode.window.showInformationMessage(`MyCode AI ${!cur ? 'enabled' : 'disabled'}`);
  }));

  _globalStore.add(vscode.commands.registerCommand('mycode-ai.executeTool',
    async (call: ToolCall) => {
      return toolsService.executeTool(call);
    }
  ));

  _globalStore.add(vscode.commands.registerCommand('mycode-ai.mcpStartServer',
    async (serverName: string) => {
      await mcpService.startServer(serverName);
    }
  ));
  _globalStore.add(vscode.commands.registerCommand('mycode-ai.mcpStopServer',
    async (serverName: string) => {
      mcpService.stopServer(serverName);
    }
  ));

  // --- Status bar ---
  const sb = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  sb.text = '$(hubot) MyCode AI';
  sb.tooltip = 'MyCode AI is active';
  sb.show();
  _globalStore.add(sb);

  context.subscriptions.push(_globalStore);

  console.log('MyCode AI extension activated with ' + CONTRIBUTIONS.length + ' contributions');
}

export function deactivate() {
  _globalStore?.dispose();
  console.log('MyCode AI extension deactivated');
}
