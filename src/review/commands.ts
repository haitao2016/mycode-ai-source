import * as vscode from 'vscode';
import { ReviewIssue } from '../shared/types';

export class ReviewCommands {
  public register(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.reviewFile', () => this.reviewFile()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.reviewWorkspace', () => this.reviewWorkspace()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.generateDoc', () => this.generateDoc()));
    context.subscriptions.push(vscode.commands.registerCommand('mycode-ai.refactor', () => this.refactor()));
  }

  private async reviewFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { vscode.window.showErrorMessage('No active editor'); return; }
    const content = editor.document.getText();
    const issues = await this.analyze(content, editor.document.languageId, editor.document.fileName);
    this.showResults(issues, editor.document.fileName);
  }

  private async reviewWorkspace() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) { vscode.window.showErrorMessage('No workspace'); return; }
    const allIssues: ReviewIssue[] = [];
    for (const folder of folders) {
      const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, '**/*.{ts,tsx,js,jsx,py,go,rs,java,css,scss}'));
      for (const file of files) {
        try {
          const content = (await vscode.workspace.fs.readFile(file)).toString();
          allIssues.push(...await this.analyze(content, this.getLang(file.fsPath), file.fsPath));
        } catch { continue; }
      }
    }
    this.showResults(allIssues, 'Workspace');
  }

  private async generateDoc() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { vscode.window.showErrorMessage('No active editor'); return; }
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    if (!apiKey) { vscode.window.showErrorMessage('API key not configured'); return; }
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Generating docs...' }, async () => {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: config.get('model', 'gpt-4o'), messages: [{ role: 'system', content: 'Generate comprehensive documentation for the provided code.' }, { role: 'user', content: editor.document.getText().substring(0, 5000) }], temperature: 0.7, max_tokens: 2000 }),
        });
        const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const doc = data.choices?.[0]?.message?.content ?? '';
        const uri = vscode.Uri.file(editor.document.fileName + '.md');
        await vscode.workspace.fs.writeFile(uri, Buffer.from(doc));
        await vscode.window.showTextDocument(uri);
      } catch (e) { vscode.window.showErrorMessage('Failed: ' + String(e)); }
    });
  }

  private async refactor() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { vscode.window.showErrorMessage('No active editor'); return; }
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    if (!apiKey) { vscode.window.showErrorMessage('API key not configured'); return; }
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Refactoring...' }, async () => {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: config.get('model', 'gpt-4o'), messages: [{ role: 'system', content: 'Suggest refactoring improvements and provide improved code.' }, { role: 'user', content: editor.document.getText().substring(0, 5000) }], temperature: 0.7, max_tokens: 2000 }),
        });
        const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
        const doc = await vscode.workspace.openTextDocument({ content: data.choices?.[0]?.message?.content ?? '', language: editor.document.languageId });
        await vscode.window.showTextDocument(doc);
      } catch (e) { vscode.window.showErrorMessage('Failed: ' + String(e)); }
    });
  }

  private async analyze(content: string, language: string, fileName: string): Promise<ReviewIssue[]> {
    const config = vscode.workspace.getConfiguration('mycode-ai');
    const apiKey = config.get<string>('apiKey', '');
    if (!apiKey) { vscode.window.showErrorMessage('API key not configured'); return []; }
    const reviewConfig = vscode.workspace.getConfiguration('mycode-ai.review');
    const checks = [];
    if (reviewConfig.get('checkStyle', true)) checks.push('code style');
    if (reviewConfig.get('checkPerformance', true)) checks.push('performance');
    if (reviewConfig.get('checkSecurity', true)) checks.push('security');
    if (reviewConfig.get('checkBestPractices', true)) checks.push('best practices');
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: config.get('model', 'gpt-4o'), messages: [{ role: 'system', content: 'Review code. Output JSON array: [{"line":1,"severity":"warning","message":"...","suggestion":"..."}]' }, { role: 'user', content: `Review ${language} file ${fileName} for ${checks.join(', ')}:\n${content.substring(0, 5000)}` }], temperature: 0.3, max_tokens: 1500 }),
      });
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content ?? '';
      try {
        const match = text.match(/\[.*\]/s);
        if (match) return JSON.parse(match[0]) as ReviewIssue[];
      } catch {}
      return this.parseReview(text);
    } catch { return []; }
  }

  private parseReview(text: string): ReviewIssue[] {
    const issues: ReviewIssue[] = [];
    text.split('\n').forEach((line, i) => {
      if (line.includes('ERROR') || line.includes('Error')) issues.push({ line: i + 1, severity: 'error', message: line.trim(), suggestion: 'Fix this issue' });
      else if (line.includes('WARNING') || line.includes('Warning')) issues.push({ line: i + 1, severity: 'warning', message: line.trim(), suggestion: 'Consider improving' });
      else if (line.includes('INFO') || line.includes('Info')) issues.push({ line: i + 1, severity: 'info', message: line.trim(), suggestion: 'Best practice' });
    });
    return issues;
  }

  private showResults(issues: ReviewIssue[], title: string) {
    if (issues.length === 0) { vscode.window.showInformationMessage('No issues found'); return; }
    const coll = vscode.languages.createDiagnosticCollection('mycode-ai-review');
    const map = new Map<vscode.Uri, vscode.Diagnostic[]>();
    const uri = vscode.window.activeTextEditor?.document.uri || vscode.Uri.file(title);
    issues.forEach(i => {
      if (!map.has(uri)) map.set(uri, []);
      map.get(uri)!.push(new vscode.Diagnostic(
        new vscode.Range(i.line - 1, 0, i.line - 1, 100),
        `${i.message}\nSuggestion: ${i.suggestion}`,
        i.severity === 'error' ? vscode.DiagnosticSeverity.Error : i.severity === 'warning' ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Information
      ));
    });
    map.forEach((d, u) => coll.set(u, d));
    const errs = issues.filter(i => i.severity === 'error').length;
    const warns = issues.filter(i => i.severity === 'warning').length;
    const infos = issues.filter(i => i.severity === 'info').length;
    vscode.window.showInformationMessage(`Review: ${errs} errors, ${warns} warnings, ${infos} info`);
  }

  private getLang(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = { ts: 'typescript', tsx: 'typescriptreact', js: 'javascript', jsx: 'javascriptreact', py: 'python', go: 'go', rs: 'rust', java: 'java', css: 'css', scss: 'scss' };
    return map[ext] ?? 'plaintext';
  }
}
