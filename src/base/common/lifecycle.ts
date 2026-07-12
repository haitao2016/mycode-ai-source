export interface IDisposable { dispose(): void; }

export class DisposableStore implements IDisposable {
  private _toDispose = new Set<IDisposable>();
  private _isDisposed = false;
  public add<T extends IDisposable>(t: T): T { if (!this._isDisposed) this._toDispose.add(t); else t.dispose(); return t; }
  public dispose(): void { if (this._isDisposed) return; this._isDisposed = true; for (const d of this._toDispose) { try { d.dispose(); } catch {} } this._toDispose.clear(); }
  public get isDisposed(): boolean { return this._isDisposed; }
}

export class Disposable implements IDisposable {
  protected readonly _store = new DisposableStore();
  public dispose(): void { this._store.dispose(); }
}

export function toDisposable(fn: () => void): IDisposable { return { dispose: fn }; }
export const DisposableNone = Object.freeze<IDisposable>({ dispose() {} });
