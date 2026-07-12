const _regs = new Map<string, unknown>();

export interface IRegistry<T> { add(item: T): void; get(id: string): T | undefined; getAll(): T[]; }

class RegistryImpl<T extends { id: string }> implements IRegistry<T> {
  private _items = new Map<string, T>();
  add(item: T): void { this._items.set(item.id, item); }
  get(id: string): T | undefined { return this._items.get(id); }
  getAll(): T[] { return [...this._items.values()]; }
}

export namespace Registry {
  export function add<T extends { id: string }>(key: string, item: T): void {
    let reg = _regs.get(key) as RegistryImpl<T> | undefined;
    if (!reg) { reg = new RegistryImpl<T>(); _regs.set(key, reg); }
    reg.add(item);
  }
  export function get<T extends { id: string }>(key: string): IRegistry<T> {
    let reg = _regs.get(key) as RegistryImpl<T> | undefined;
    if (!reg) { reg = new RegistryImpl<T>(); _regs.set(key, reg); }
    return reg;
  }
  export function as<T extends { id: string }>(key: string): IRegistry<T> { return get<T>(key); }
}

export const RegistryKeys = {
  WorkbenchContributions: 'workbench.contributions',
  Views: 'views',
  Commands: 'commands',
  AIProviders: 'ai.providers',
  Actions: 'actions',
} as const;
