/*---------------------------------------------------------------------------------------------
 *  MyCode AI — Platform Layer: Dependency Injection
 *  Modeled after VS Code's src/vs/platform/instantiation
 *--------------------------------------------------------------------------------------------*/

type Ctor<T> = new (...args: unknown[]) => T;
type ServiceIdentifier<T> = string & { _brand: 'serviceId' };

const _services = new Map<ServiceIdentifier<unknown>, Ctor<unknown>>();
const _instances = new Map<ServiceIdentifier<unknown>, unknown>();

/** Unique service ID helper */
export function createServiceId<T>(name: string): ServiceIdentifier<T> {
  return `svc:${name}` as ServiceIdentifier<T>;
}

/** Service-collection interface (simulating VS Code's SyncDescriptor) */
export interface IService<T> {
  readonly id: ServiceIdentifier<T>;
  readonly ctor: Ctor<T>;
}

/** Register a service with its constructor */
export function registerService<T>(id: ServiceIdentifier<T>, ctor: Ctor<T>): IService<T> {
  _services.set(id, ctor);
  return { id, ctor };
}

/** Resolve (create or return cached) a service by identifier */
export function getService<T>(id: ServiceIdentifier<T>): T {
  if (_instances.has(id)) return _instances.get(id) as T;
  const ctor = _services.get(id);
  if (!ctor) throw new Error(`Service not registered: ${id}`);
  const instance = new (ctor as Ctor<T>)();
  _instances.set(id, instance);
  return instance;
}

/** A snapshot of all registered service ids */
export function registeredServices(): ReadonlyArray<string> {
  return [..._services.keys()];
}

/** Override an already cached instance (for testing) */
export function overrideService<T>(id: ServiceIdentifier<T>, instance: T): void {
  _instances.set(id, instance);
}
