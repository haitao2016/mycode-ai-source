import { DisposableStore, Disposable } from '../base/common/lifecycle';

export interface IWorkbenchContribution { activate(store: DisposableStore): void | Promise<void>; }

export { DisposableStore, Disposable } from '../base/common/lifecycle';
