import * as vscode from 'vscode';
import { DisposableStore, IWorkbenchContribution } from '../../common';

interface ICommand { id: string; handler: (...args: unknown[]) => unknown; }

const _commands = new DisposableStore();

export function registerCommand(id: string, handler: (...args: unknown[]) => unknown): void {
  _commands.add(vscode.commands.registerCommand(id, handler));
}

export const Commands = {
  register: registerCommand,
  store: _commands,
};
