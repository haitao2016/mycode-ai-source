import { globalEventBus, AppEvents, EventBus } from './eventBus';

export type ServiceStatus = 'idle' | 'initializing' | 'started' | 'stopped' | 'error';

export interface ServiceConfig {
  name: string;
  dependencies?: string[];
  autoStart?: boolean;
  priority?: number;
}

export abstract class BaseService {
  config: ServiceConfig;
  protected _status: ServiceStatus = 'idle';
  protected error?: Error;
  protected initializationPromise?: Promise<void>;
  protected eventBus: EventBus;

  constructor(name: string, eventBus: EventBus) {
    this.config = {
      autoStart: true,
      priority: 0,
      name,
    };
    this.eventBus = eventBus;
  }

  get name(): string {
    return this.config.name;
  }

  get status(): ServiceStatus {
    return this._status;
  }

  get dependencies(): string[] {
    return this.config.dependencies || [];
  }

  get isStarted(): boolean {
    return this.status === 'started';
  }

  get isInitializing(): boolean {
    return this.status === 'initializing';
  }

  get isError(): boolean {
    return this.status === 'error';
  }

  get errorMessage(): string | undefined {
    return this.error?.message;
  }

  async start(): Promise<void> {
    if (this.status === 'started') {
      return;
    }

    if (this.status === 'initializing') {
      return this.initializationPromise;
    }

    this._status = 'initializing';

    try {
      this.initializationPromise = this.onStart();
      await this.initializationPromise;

      this._status = 'started';
      this.error = undefined;

      globalEventBus.emitServiceStarted(this.name);
    } catch (err) {
      this._status = 'error';
      this.error = err instanceof Error ? err : new Error(String(err));

      globalEventBus.emitError(this.error);
      throw this.error;
    }
  }

  async stop(): Promise<void> {
    if (this.status !== 'started') {
      return;
    }

    try {
      await this.onStop();
      this._status = 'stopped';

      globalEventBus.emitServiceStopped(this.name);
    } catch (err) {
      this.error = err instanceof Error ? err : new Error(String(err));
      throw this.error;
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  protected abstract onStart(): Promise<void>;

  protected onStop(): Promise<void> {
    return Promise.resolve();
  }

  emit<T = unknown>(eventType: string, payload: T): void {
    globalEventBus.emit(eventType, payload, this.name);
  }

  on<T = unknown>(
    eventType: string,
    handler: (payload: T) => void,
    options?: { priority?: number; debounce?: number; throttle?: number }
  ): () => void {
    return globalEventBus.on(eventType, handler, options);
  }

  once<T = unknown>(eventType: string, handler: (payload: T) => void): () => void {
    return globalEventBus.once(eventType, handler);
  }

  off<T = unknown>(eventType: string, handler?: (payload: T) => void): void {
    globalEventBus.off(eventType, handler);
  }

  dispose(): void {
    this.stop().catch(() => {});
  }
}

export class ServiceContainer {
  private services = new Map<string, BaseService>();
  private startedServices = new Set<string>();
  private serviceOrder: string[] = [];

  register(service: BaseService): void {
    const name = service.name;

    if (this.services.has(name)) {
      throw new Error(`Service "${name}" already registered`);
    }

    this.services.set(name, service);
    this.serviceOrder.push(name);

    this.serviceOrder.sort((a, b) => {
      const serviceA = this.services.get(a)!;
      const serviceB = this.services.get(b)!;
      return (serviceB.config.priority || 0) - (serviceA.config.priority || 0);
    });
  }

  registerAll(services: BaseService[]): void {
    services.forEach((service) => this.register(service));
  }

  get<T extends BaseService>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  getAll(): BaseService[] {
    return this.serviceOrder.map((name) => this.services.get(name)!).filter(Boolean);
  }

  getByStatus(status: ServiceStatus): BaseService[] {
    return this.getAll().filter((service) => service.status === status);
  }

  async startAll(): Promise<void> {
    for (const name of this.serviceOrder) {
      const service = this.services.get(name)!;

      if (!service.config.autoStart) {
        continue;
      }

      try {
        await this.start(service.name);
      } catch (err) {
        console.error(`Failed to start service "${service.name}":`, err);
      }
    }
  }

  async start(name: string): Promise<void> {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service "${name}" not found`);
    }

    if (this.startedServices.has(name)) {
      return;
    }

    for (const depName of service.dependencies) {
      if (!this.startedServices.has(depName)) {
        await this.start(depName);
      }
    }

    await service.start();
    this.startedServices.add(name);
  }

  async stopAll(): Promise<void> {
    for (const name of [...this.startedServices].reverse()) {
      const service = this.services.get(name);
      if (service) {
        try {
          await service.stop();
        } catch (err) {
          console.error(`Failed to stop service "${name}":`, err);
        }
      }
      this.startedServices.delete(name);
    }
  }

  async stop(name: string): Promise<void> {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service "${name}" not found`);
    }

    await service.stop();
    this.startedServices.delete(name);
  }

  async restart(name: string): Promise<void> {
    await this.stop(name);
    await this.start(name);
  }

  dispose(): void {
    this.stopAll().catch(() => {});
    this.services.clear();
    this.startedServices.clear();
    this.serviceOrder = [];
  }

  getStatus(name: string): ServiceStatus | undefined {
    return this.services.get(name)?.status;
  }

  isStarted(name: string): boolean {
    return this.startedServices.has(name);
  }
}

export const serviceContainer = new ServiceContainer();

export const useServiceContainer = () => serviceContainer;
