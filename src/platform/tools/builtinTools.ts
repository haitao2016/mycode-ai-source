/*---------------------------------------------------------------------------------------------
 *  MyCode AI — Built-in Tools (ported from Void)
 *  16 tools: file ops, search, lint, terminal, edit
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { ToolDefinition, BuiltinToolName } from '../../shared/types';

// ============================================================
// File Tools
// ============================================================

const readFileTool: ToolDefinition = {
  name: 'read_file',
  description: 'Read the contents of a file at the given path',
  params: { path: { type: 'string', description: 'Absolute or relative path to the file', required: true } },
  approvalType: undefined,
  async execute(params: Record<string, unknown>): Promise<string> {
    const p = params.path as string;
    const uri = vscode.Uri.file(p);
    try {
      const bytes = await vscode.workspace.fs.readFile(uri);
      return new TextDecoder().decode(bytes);
    } catch (e) { return `Error reading ${p}: ${e}`; }
  },
};

const lsDirTool: ToolDefinition = {
  name: 'ls_dir',
  description: 'List files and directories in the given path',
  params: { path: { type: 'string', description: 'Directory path', required: true } },
  approvalType: undefined,
  async execute(params: Record<string, unknown>): Promise<string> {
    const p = params.path as string;
    const uri = vscode.Uri.file(p);
    try {
      const entries = await vscode.workspace.fs.readDirectory(uri);
      return entries.map(([name, type]) => `${type === 2 ? '[D]' : '[F]'} ${name}`).join('\n');
    } catch (e) { return `Error listing ${p}: ${e}`; }
  },
};

const getDirTreeTool: ToolDefinition = {
  name: 'get_dir_tree',
  description: 'Get a recursive tree view of a directory',
  params: { path: { type: 'string', description: 'Directory path', required: true }, depth: { type: 'number', description: 'Max depth (default 3)' } },
  approvalType: undefined,
  async execute(params: Record<string, unknown>): Promise<string> {
    const root = (params.path as string) || '.';
    const maxDepth = (params.depth as number) || 3;
    const lines: string[] = [];
    async function walk(dir: vscode.Uri, prefix: string, depth: number) {
      if (depth > maxDepth) return;
      try {
        const entries = await vscode.workspace.fs.readDirectory(dir);
        entries.sort((a, b) => a[0].localeCompare(b[0]));
        for (let i = 0; i < entries.length; i++) {
          const [name, type] = entries[i];
          const isLast = i === entries.length - 1;
          const marker = isLast ? '└── ' : '├── ';
          lines.push(`${prefix}${marker}${name}${type === 2 ? '/' : ''}`);
          if (type === 2) {
            await walk(vscode.Uri.joinPath(dir, name), prefix + (isLast ? '    ' : '│   '), depth + 1);
          }
        }
      } catch { /* skip */ }
    }
    await walk(vscode.Uri.file(root), '', 1);
    return lines.join('\n') || '(empty)';
  },
};

// ============================================================
// Search Tools
// ============================================================

const searchPathnamesOnlyTool: ToolDefinition = {
  name: 'search_pathnames_only',
  description: 'Find files by name pattern (glob)',
  params: { pattern: { type: 'string', description: 'Glob pattern (e.g. **/*.ts)', required: true }, cwd: { type: 'string', description: 'Working directory' } },
  approvalType: undefined,
  async execute(params: Record<string, unknown>): Promise<string> {
    const pattern = params.pattern as string;
    const cwd = (params.cwd as string) || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '.';
    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(cwd, pattern), null, 100);
    return files.map(f => f.fsPath).join('\n') || 'No matches';
  },
};

const searchForFilesTool: ToolDefinition = {
  name: 'search_for_files',
  description: 'Search for files containing a text pattern',
  params: { query: { type: 'string', description: 'Search text', required: true }, include: { type: 'string', description: 'Glob include pattern' }, cwd: { type: 'string', description: 'Working directory' } },
  approvalType: undefined,
  async execute(params: Record<string, unknown>): Promise<string> {
    const query = params.query as string;
    const include = (params.include as string) || '**/*';
    const cwd = (params.cwd as string) || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '.';
    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(cwd, include), null, 50);
    const results: string[] = [];
    for (const f of files) {
      try {
        const bytes = await vscode.workspace.fs.readFile(f);
        const content = new TextDecoder().decode(bytes);
        if (content.includes(query)) {
          results.push(f.fsPath);
        }
      } catch { /* skip */ }
    }
    return results.join('\n') || 'No matches';
  },
};

const searchInFileTool: ToolDefinition = {
  name: 'search_in_file',
  description: 'Search for text within a specific file',
  params: { path: { type: 'string', description: 'File path', required: true }, query: { type: 'string', description: 'Search text', required: true }, contextLines: { type: 'number', description: 'Context lines around match' } },
  approvalType: undefined,
  async execute(params: Record<string, unknown>): Promise<string> {
    const path = params.path as string;
    const query = params.query as string;
    const ctx = (params.contextLines as number) || 2;
    try {
      const bytes = await vscode.workspace.fs.readFile(vscode.Uri.file(path));
      const lines = new TextDecoder().decode(bytes).split('\n');
      const results: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(query)) {
          const start = Math.max(0, i - ctx);
          const end = Math.min(lines.length, i + ctx + 1);
          for (let j = start; j < end; j++) {
            results.push(`${j === i ? '>' : ' '} ${j + 1}: ${lines[j]}`);
          }
          results.push('---');
        }
      }
      return results.join('\n') || 'No matches';
    } catch (e) { return `Error: ${e}`; }
  },
};

// ============================================================
// Lint Tool
// ============================================================

const readLintErrorsTool: ToolDefinition = {
  name: 'read_lint_errors',
  description: 'Read all diagnostics (lint errors/warnings) for files in the workspace',
  params: { path: { type: 'string', description: 'Optional file path to filter' } },
  approvalType: undefined,
  async execute(params: Record<string, unknown>): Promise<string> {
    const targetPath = params.path as string | undefined;
    const allDiags = vscode.languages.getDiagnostics();
    const filtered = targetPath
      ? allDiags.filter(([uri]) => uri.fsPath.includes(targetPath))
      : allDiags;
    const lines: string[] = [];
    for (const [uri, diags] of filtered) {
      for (const d of diags) {
        const sev = d.severity === vscode.DiagnosticSeverity.Error ? 'ERROR' : d.severity === vscode.DiagnosticSeverity.Warning ? 'WARN' : 'INFO';
        lines.push(`${uri.fsPath}:${d.range.start.line + 1}:${d.range.start.character + 1} [${sev}] ${d.message}`);
      }
    }
    return lines.join('\n') || 'No diagnostics';
  },
};

// ============================================================
// Edit Tools
// ============================================================

const rewriteFileTool: ToolDefinition = {
  name: 'rewrite_file',
  description: 'Completely replace the contents of a file',
  params: { path: { type: 'string', description: 'File path', required: true }, content: { type: 'string', description: 'New file content', required: true } },
  approvalType: 'edits',
  async execute(params: Record<string, unknown>): Promise<string> {
    const p = params.path as string;
    const content = params.content as string;
    const uri = vscode.Uri.file(p);
    try {
      await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
      return `Rewrote ${p} (${content.length} chars)`;
    } catch (e) { return `Error rewriting ${p}: ${e}`; }
  },
};

const editFileTool: ToolDefinition = {
  name: 'edit_file',
  description: 'Apply a search-and-replace edit to a file',
  params: { path: { type: 'string', description: 'File path', required: true }, search: { type: 'string', description: 'Text to find', required: true }, replace: { type: 'string', description: 'Replacement text', required: true } },
  approvalType: 'edits',
  async execute(params: Record<string, unknown>): Promise<string> {
    const p = params.path as string;
    const search = params.search as string;
    const replace = params.replace as string;
    const uri = vscode.Uri.file(p);
    try {
      const bytes = await vscode.workspace.fs.readFile(uri);
      let content = new TextDecoder().decode(bytes);
      if (!content.includes(search)) return `Text not found in ${p}`;
      content = content.replace(search, replace);
      await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
      return `Applied edit to ${p}`;
    } catch (e) { return `Error editing ${p}: ${e}`; }
  },
};

const createFileOrFolderTool: ToolDefinition = {
  name: 'create_file_or_folder',
  description: 'Create a new file or folder',
  params: { path: { type: 'string', description: 'Path to create', required: true }, type: { type: 'string', description: "'file' or 'folder'", required: true }, content: { type: 'string', description: 'File content (if type is file)' } },
  approvalType: 'edits',
  async execute(params: Record<string, unknown>): Promise<string> {
    const p = params.path as string;
    const t = (params.type as string) || 'file';
    const uri = vscode.Uri.file(p);
    try {
      if (t === 'folder') {
        await vscode.workspace.fs.createDirectory(uri);
        return `Created folder: ${p}`;
      } else {
        const content = (params.content as string) || '';
        await vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(content));
        return `Created file: ${p} (${content.length} chars)`;
      }
    } catch (e) { return `Error creating ${p}: ${e}`; }
  },
};

const deleteFileOrFolderTool: ToolDefinition = {
  name: 'delete_file_or_folder',
  description: 'Delete a file or folder',
  params: { path: { type: 'string', description: 'Path to delete', required: true }, recursive: { type: 'boolean', description: 'Recursive for folders' } },
  approvalType: 'edits',
  async execute(params: Record<string, unknown>): Promise<string> {
    const p = params.path as string;
    const uri = vscode.Uri.file(p);
    try {
      await vscode.workspace.fs.delete(uri, { recursive: (params.recursive as boolean) || false });
      return `Deleted: ${p}`;
    } catch (e) { return `Error deleting ${p}: ${e}`; }
  },
};

// ============================================================
// Terminal Tools
// ============================================================

const runCommandTool: ToolDefinition = {
  name: 'run_command',
  description: 'Run a shell command and return its output',
  params: { command: { type: 'string', description: 'Shell command', required: true }, cwd: { type: 'string', description: 'Working directory' } },
  approvalType: 'terminal',
  async execute(params: Record<string, unknown>): Promise<string> {
    const cmd = params.command as string;
    const cwd = (params.cwd as string) || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '.';
    const { exec } = await import('child_process');
    return new Promise<string>((resolve) => {
      exec(cmd, { cwd, timeout: 30000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
        resolve(err ? `Error: ${err.message}\n${stderr || ''}` : stdout || '(no output)');
      });
    });
  },
};

const openPersistentTerminalTool: ToolDefinition = {
  name: 'open_persistent_terminal',
  description: 'Open a persistent terminal in VS Code',
  params: { name: { type: 'string', description: 'Terminal name' }, cwd: { type: 'string', description: 'Working directory' } },
  approvalType: 'terminal',
  async execute(params: Record<string, unknown>): Promise<string> {
    const name = (params.name as string) || 'MyCode AI Terminal';
    const cwd = (params.cwd as string) || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const terminal = vscode.window.createTerminal({ name, cwd: cwd ? vscode.Uri.file(cwd) : undefined });
    terminal.show();
    return `Opened terminal: ${name}`;
  },
};

const runPersistentCommandTool: ToolDefinition = {
  name: 'run_persistent_command',
  description: 'Run a command in the last active terminal',
  params: { command: { type: 'string', description: 'Shell command', required: true } },
  approvalType: 'terminal',
  async execute(params: Record<string, unknown>): Promise<string> {
    const cmd = params.command as string;
    const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('MyCode AI');
    terminal.show();
    terminal.sendText(cmd);
    return `Sent to terminal: ${cmd}`;
  },
};

const killPersistentTerminalTool: ToolDefinition = {
  name: 'kill_persistent_terminal',
  description: 'Kill the active terminal',
  params: {},
  approvalType: 'terminal',
  async execute(_params: Record<string, unknown>): Promise<string> {
    const terminal = vscode.window.activeTerminal;
    if (terminal) { terminal.dispose(); return 'Terminal killed'; }
    return 'No active terminal';
  },
};

// ============================================================
// Registry
// ============================================================

export const allBuiltinTools: ToolDefinition[] = [
  readFileTool, lsDirTool, getDirTreeTool,
  searchPathnamesOnlyTool, searchForFilesTool, searchInFileTool, readLintErrorsTool,
  rewriteFileTool, editFileTool, createFileOrFolderTool, deleteFileOrFolderTool,
  runCommandTool, openPersistentTerminalTool, runPersistentCommandTool, killPersistentTerminalTool,
];

export const builtinToolsByName: Map<string, ToolDefinition> = new Map(
  allBuiltinTools.map(t => [t.name, t])
);

export function getBuiltinTool(name: string): ToolDefinition | undefined {
  return builtinToolsByName.get(name);
}

export function getBuiltinToolsByApproval(type: string): ToolDefinition[] {
  return allBuiltinTools.filter(t => t.approvalType === type);
}
