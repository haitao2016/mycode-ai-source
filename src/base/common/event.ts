import { IDisposable, toDisposable } from './lifecycle';

export interface Event<T> {
  (listener: (e: T) => void, thisArgs?: unknown): IDisposable;
}

export class Emitter<T> {
  private _listeners: Set<{ fn: (e: T) => void; thisArg: unknown }> = new Set();
  private _disposed = false;

  public readonly event: Event<T> = (listener: (e: T) => void, thisArgs?: unknown): IDisposable => {
    const entry = { fn: listener, thisArg: thisArgs };
    this._listeners.add(entry);
    return toDisposable(() => this._listeners.delete(entry));
  };

  public fire(event: T): void {
    if (this._disposed) return;
    for (const l of this._listeners) {
      try { l.fn.call(l.thisArg, event); } catch (e) { console.error(e); }
    }
  }

  public dispose(): void { this._disposed = true; this._listeners.clear(); }
  public get hasListeners(): boolean { return this._listeners.size > 0; }
}
