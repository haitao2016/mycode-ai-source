/*---------------------------------------------------------------------------------------------
 *  MyCode AI — Base Layer: Async helpers
 *  Modeled after VS Code's src/vs/base/common/async.ts
 *--------------------------------------------------------------------------------------------*/

/** Promisified setTimeout */
export function timeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Retry an async operation with backoff */
export async function retry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 500): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= maxRetries; i++) {
    try { return await fn(); }
    catch (e) { lastErr = e; if (i < maxRetries) await timeout(delayMs * (i + 1)); }
  }
  throw lastErr;
}

/** Debounce an async function — last call wins */
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T & { cancel(): void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = ((...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    return new Promise(resolve => { timer = setTimeout(() => resolve(fn(...args)), ms); });
  }) as T & { cancel(): void };
  debounced.cancel = () => { if (timer) { clearTimeout(timer); timer = undefined; } };
  return debounced;
}

/** VS Code's pattern: run a promise with a timeout */
export function withTimeout<T>(promise: Promise<T>, ms: number, onTimeout: () => T): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<T>(resolve => { timer = setTimeout(() => resolve(onTimeout()), ms); }),
  ]).finally(() => clearTimeout(timer!));
}
