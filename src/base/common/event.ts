/*---------------------------------------------------------------------------------------------
 *  MyCode AI — Base Layer: Event / Emitter
 *  Modeled after VS Code's src/vs/base/common/event.ts
 *--------------------------------------------------------------------------------------------*/

import { IDisposable, toDisposable } from './lifecycle';

/** Typed callback for a single event emission */
export interface Event<T> {
  (listener: (e: T) => void, thisArgs?: unknown): IDisposable;
}

/**
 * EventEmitter — typed signal source.
 * In VS Code this is a more complex class with delivery queues and error guards;
 * here we keep it minimal but with the same public shape.
 */
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

  public dispose(): void {
    this._disposed = true;
    this._listeners.clear();
  }

  public get hasListeners(): boolean { return this._listeners.size > 0; }
}

/** Fires once after the micro-task queue drains */
export function defer<T>(promise: Promise<T>): void { /* no-op for now */ }
