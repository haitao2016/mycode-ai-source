import * as vscode from 'vscode';

export let extensionContext: vscode.ExtensionContext;

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  outputChannel = vscode.window.createOutputChannel('MyCode AI Tasks');

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.tasks.run', async () => {
      await runTask();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.tasks.build', async () => {
      await buildProject();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.tasks.test', async () => {
      await runTests();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.tasks.clean', async () => {
      await cleanBuild();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.tasks.show-output', () => {
      showOutput();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.tasks.clear-output', () => {
      clearOutput();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.tasks.configure', async () => {
      await configureTasks();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('mycode-ai.tasks.create', async () => {
      await createTask();
    })
  );

  context.subscriptions.push(outputChannel);

  console.log('MyCode AI Tasks extension activated');
}

export function deactivate() {}

async function runTask() {
  const tasks = await vscode.tasks.fetchTasks();
  
  if (tasks.length === 0) {
    vscode.window.showInformationMessage('No tasks found. Create a task first.');
    return;
  }

  const items: vscode.QuickPickItem[] = tasks.map(task => ({
    label: task.name,
    description: task.source || ''
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a task to run'
  });

  if (selected) {
    const task = tasks.find(t => t.name === selected.label);
    if (task) {
      await vscode.tasks.executeTask(task);
    }
  }
}

async function buildProject() {
  const config = vscode.workspace.getConfiguration('mycode-ai.tasks');
  
  if (config.get('autoOpenOutput', true)) {
    outputChannel.show();
  }

  outputChannel.appendLine('=== Building project ===');
  outputChannel.appendLine('');

  try {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      title: 'Building project...'
    }, async (progress) => {
      progress.report({ increment: 0 });

      const terminal = vscode.window.createTerminal('Build Terminal');
      terminal.sendText('npm run build');
      terminal.show();

      progress.report({ increment: 100 });
    });

    if (config.get('showNotifications', true)) {
      vscode.window.showInformationMessage('Build started successfully');
    }
  } catch (error) {
    outputChannel.appendLine('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    vscode.window.showErrorMessage('Build failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function runTests() {
  const config = vscode.workspace.getConfiguration('mycode-ai.tasks');
  
  if (config.get('autoOpenOutput', true)) {
    outputChannel.show();
  }

  outputChannel.appendLine('=== Running tests ===');
  outputChannel.appendLine('');

  try {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      title: 'Running tests...'
    }, async (progress) => {
      progress.report({ increment: 0 });

      const terminal = vscode.window.createTerminal('Test Terminal');
      terminal.sendText('npm run test');
      terminal.show();

      progress.report({ increment: 100 });
    });

    if (config.get('showNotifications', true)) {
      vscode.window.showInformationMessage('Tests started successfully');
    }
  } catch (error) {
    outputChannel.appendLine('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    vscode.window.showErrorMessage('Tests failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

async function cleanBuild() {
  const config = vscode.workspace.getConfiguration('mycode-ai.tasks');
  
  if (config.get('autoOpenOutput', true)) {
    outputChannel.show();
  }

  outputChannel.appendLine('=== Cleaning build ===');
  outputChannel.appendLine('');

  try {
    const terminal = vscode.window.createTerminal('Clean Terminal');
    terminal.sendText('rm -rf dist release node_modules/.cache');
    terminal.show();

    if (config.get('showNotifications', true)) {
      vscode.window.showInformationMessage('Clean started successfully');
    }
  } catch (error) {
    outputChannel.appendLine('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    vscode.window.showErrorMessage('Clean failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

function showOutput() {
  outputChannel.show();
}

function clearOutput() {
  outputChannel.clear();
}

async function configureTasks() {
  await vscode.commands.executeCommand('workbench.action.tasks.configureTasks');
}

async function createTask() {
  const taskName = await vscode.window.showInputBox({
    prompt: 'Enter task name',
    placeHolder: 'e.g., Build Project'
  });

  if (!taskName) return;

  const command = await vscode.window.showInputBox({
    prompt: 'Enter command to execute',
    placeHolder: 'e.g., npm run build'
  });

  if (!command) return;

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace open');
    return;
  }

  const tasksFilePath = vscode.Uri.joinPath(workspaceFolders[0].uri, '.vscode', 'tasks.json');
  
  let tasksConfig: { version: string; tasks: Array<{ label: string; type: string; command: string }> } = {
    version: '2.0.0',
    tasks: []
  };

  try {
    const existingContent = await vscode.workspace.fs.readFile(tasksFilePath);
    tasksConfig = JSON.parse(existingContent.toString());
  } catch {
    // File doesn't exist, use default
  }

  tasksConfig.tasks.push({
    label: taskName,
    type: 'shell',
    command: command
  });

  await vscode.workspace.fs.writeFile(tasksFilePath, Buffer.from(JSON.stringify(tasksConfig, null, 2)));
  vscode.window.showInformationMessage('Task created successfully');
}

function logTaskEvent(event: string, details?: string) {
  const timestamp = new Date().toLocaleTimeString();
  outputChannel.appendLine(`[${timestamp}] ${event}${details ? ': ' + details : ''}`);
}

function setupTaskEventListeners(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.tasks.onDidStartTask((event) => {
      logTaskEvent('Task started');
    })
  );

  context.subscriptions.push(
    vscode.tasks.onDidEndTask((event) => {
      logTaskEvent('Task ended');
    })
  );

  context.subscriptions.push(
    vscode.tasks.onDidStartTaskProcess((event) => {
      logTaskEvent('Task process started');
    })
  );

  context.subscriptions.push(
    vscode.tasks.onDidEndTaskProcess((event) => {
      logTaskEvent('Task process ended');
    })
  );
}
