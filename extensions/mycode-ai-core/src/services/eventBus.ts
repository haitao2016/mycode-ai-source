/**
 * 事件处理器类型定义
 * @template T - 事件载荷类型
 */
export type EventHandler<T = unknown> = (payload: T) => void;

/**
 * 应用事件接口
 * @template T - 事件载荷类型
 */
export interface AppEvent<T = unknown> {
  /** 事件类型 */
  type: string;
  /** 事件载荷数据 */
  payload: T;
  /** 事件触发时间戳 */
  timestamp: number;
  /** 事件来源标识 */
  source?: string;
}

/**
 * 事件监听器接口
 * @template T - 事件载荷类型
 */
export interface EventListener<T = unknown> {
  /** 事件处理函数 */
  handler: EventHandler<T>;
  /** 优先级，数值越大优先级越高 */
  priority: number;
  /** 是否只执行一次 */
  once: boolean;
  /** 防抖延迟（毫秒） */
  debounce?: number;
  /** 节流间隔（毫秒） */
  throttle?: number;
}

/**
 * 预定义的应用事件类型常量
 */
export const AppEvents = {
  /** 文件打开事件 */
  FILE_OPENED: 'file:opened',
  /** 文件保存事件 */
  FILE_SAVED: 'file:saved',
  /** 文件关闭事件 */
  FILE_CLOSED: 'file:closed',
  /** 文件内容变更事件 */
  FILE_CHANGED: 'file:changed',

  /** 项目创建事件 */
  PROJECT_CREATED: 'project:created',
  /** 项目打开事件 */
  PROJECT_OPENED: 'project:opened',
  /** 项目关闭事件 */
  PROJECT_CLOSED: 'project:closed',

  /** 编辑器文本变更事件 */
  EDITOR_TEXT_CHANGED: 'editor:textChanged',
  /** 编辑器光标移动事件 */
  EDITOR_CURSOR_MOVED: 'editor:cursorMoved',
  /** 编辑器选区变更事件 */
  EDITOR_SELECTION_CHANGED: 'editor:selectionChanged',

  /** AI 自动补全事件 */
  AI_COMPLETION: 'ai:completion',
  /** AI 响应事件 */
  AI_RESPONSE: 'ai:response',
  /** AI 错误事件 */
  AI_ERROR: 'ai:error',

  /** 面板打开事件 */
  PANEL_OPENED: 'panel:opened',
  /** 面板关闭事件 */
  PANEL_CLOSED: 'panel:closed',

  /** 主题变更事件 */
  THEME_CHANGED: 'theme:changed',
  /** 设置变更事件 */
  SETTINGS_CHANGED: 'settings:changed',

  /** 命令执行事件 */
  COMMAND_EXECUTED: 'command:executed',

  /** 扩展安装事件 */
  EXTENSION_INSTALLED: 'extension:installed',
  /** 扩展卸载事件 */
  EXTENSION_UNINSTALLED: 'extension:uninstalled',
  /** 扩展启用事件 */
  EXTENSION_ENABLED: 'extension:enabled',

  /** 构建开始事件 */
  BUILD_STARTED: 'build:started',
  /** 构建进度事件 */
  BUILD_PROGRESS: 'build:progress',
  /** 构建完成事件 */
  BUILD_COMPLETED: 'build:completed',
  /** 构建失败事件 */
  BUILD_FAILED: 'build:failed',

  /** 调试开始事件 */
  DEBUG_STARTED: 'debug:started',
  /** 调试停止事件 */
  DEBUG_STOPPED: 'debug:stopped',
  /** 断点事件 */
  DEBUG_BREAKPOINT: 'debug:breakpoint',

  /** 性能监控数据事件 */
  MONITOR_DATA: 'monitor:data',

  /** 服务启动事件 */
  SERVICE_STARTED: 'service:started',
  /** 服务停止事件 */
  SERVICE_STOPPED: 'service:stopped',

  /** 错误事件 */
  ERROR: 'error',
  /** 警告事件 */
  WARNING: 'warning',
  /** 信息事件 */
  INFO: 'info',

  /** 代码变更事件 */
  CODE_CHANGE: 'code:change',
  /** 光标变更事件 */
  CURSOR_CHANGE: 'cursor:change',

  /** AI 代码审查完成事件 */
  AI_CODE_REVIEW_COMPLETE: 'ai:codeReviewComplete',

  /** 代码审查完成事件 */
  CODE_REVIEW_COMPLETE: 'codeReview:complete',
  /** 代码审查规则添加事件 */
  CODE_REVIEW_RULE_ADD: 'codeReview:ruleAdd',
  /** 代码审查规则移除事件 */
  CODE_REVIEW_RULE_REMOVE: 'codeReview:ruleRemove',
  /** 代码审查规则更新事件 */
  CODE_REVIEW_RULE_UPDATE: 'codeReview:ruleUpdate',
  /** 代码审查应用修复事件 */
  CODE_REVIEW_APPLY_FIX: 'codeReview:applyFix',

  /** 协作状态变更事件 */
  COLLABORATION_STATUS_CHANGE: 'collaboration:statusChange',
  /** 协作者变更事件 */
  COLLABORATION_COLLABORATORS_CHANGE: 'collaboration:collaboratorsChange',
  /** 协作聊天消息事件 */
  COLLABORATION_CHAT_MESSAGE: 'collaboration:chatMessage',
  /** 协作代码变更事件 */
  COLLABORATION_CODE_CHANGE: 'collaboration:codeChange',
} as const;

/**
 * 事件总线服务类
 * 提供事件发布/订阅机制，支持优先级、防抖、节流等特性
 */
export class EventBus {
  private listeners = new Map<string, EventListener<any>[]>();
  private debounceTimers = new Map<string, Map<EventHandler<any>, NodeJS.Timeout>>();
  private throttleTimers = new Map<string, Map<EventHandler<any>, boolean>>();
  private eventHistory: AppEvent[] = [];
  private maxHistorySize = 100;

  /**
   * 订阅事件
   * @template T - 事件载荷类型
   * @param type - 事件类型
   * @param handler - 事件处理函数
   * @param options - 订阅选项
   * @returns 取消订阅函数
   */
  on<T = unknown>(
    type: string,
    handler: EventHandler<T>,
    options: {
      priority?: number;
      debounce?: number;
      throttle?: number;
    } = {}
  ): () => void {
    const { priority = 0, debounce, throttle } = options;

    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    const listener: EventListener<T> = {
      handler: handler as EventHandler<unknown>,
      priority,
      once: false,
      debounce,
      throttle,
    };

    const listeners = this.listeners.get(type)!;
    listeners.push(listener);
    listeners.sort((a, b) => b.priority - a.priority);

    return () => this.off(type, handler);
  }

  /**
   * 取消订阅事件
   * @template T - 事件载荷类型
   * @param type - 事件类型
   * @param handler - 可选的事件处理函数，不传则取消该类型所有订阅
   */
  off<T = unknown>(type: string, handler?: EventHandler<T>): void {
    if (!this.listeners.has(type)) return;

    if (handler === undefined) {
      this.listeners.delete(type);
      return;
    }

    const listeners = this.listeners.get(type)!;
    const index = listeners.findIndex((l) => l.handler === handler);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * 发布事件
   * @template T - 事件载荷类型
   * @param event - 事件对象或事件类型
   * @param payload - 事件载荷（当第一个参数为类型字符串时使用）
   * @param source - 事件来源标识（当第一个参数为类型字符串时使用）
   */
  emit<T = unknown>(event: AppEvent<T>): void;
  emit<T = unknown>(type: string, payload: T, source?: string): void;
  emit<T = unknown>(...args: unknown[]): void {
    let type: string;
    let payload: T;
    let source: string | undefined;

    if (typeof args[0] === 'object' && args[0] !== null && 'type' in args[0]) {
      const event = args[0] as AppEvent<T>;
      type = event.type;
      payload = event.payload;
      source = event.source;
    } else {
      [type, payload, source] = args as [string, T, string | undefined];
    }

    this.recordEvent(type, payload, source);

    const listeners = this.listeners.get(type) || [];
    const wildcardListeners = this.listeners.get('*') || [];
    const matchingWildcardListeners = this.listeners.get(`${type.split(':')[0]}:*`) || [];

    const allListeners = [...wildcardListeners, ...matchingWildcardListeners, ...listeners];

    for (const listener of allListeners) {
      this.executeListener(listener, payload, type);
    }
  }

  /**
   * 执行监听器（内部方法）
   */
  private executeListener<T>(listener: EventListener<T>, payload: T, type: string): void {
    const { handler, once, debounce, throttle } = listener;

    if (debounce) {
      if (!this.debounceTimers.has(type)) {
        this.debounceTimers.set(type, new Map());
      }
      const timers = this.debounceTimers.get(type)!;

      if (timers.has(handler)) {
        clearTimeout(timers.get(handler)!);
      }

      const timerId = setTimeout(() => {
        handler(payload);
        timers.delete(handler);
        if (once) {
          this.off(type, handler);
        }
      }, debounce);

      timers.set(handler, timerId);
      return;
    }

    if (throttle) {
      if (!this.throttleTimers.has(type)) {
        this.throttleTimers.set(type, new Map());
      }
      const timers = this.throttleTimers.get(type)!;

      if (!timers.get(handler)) {
        handler(payload);
        timers.set(handler, true);

        setTimeout(() => {
          timers.set(handler, false);
        }, throttle);
      }

      if (once) {
        this.off(type, handler);
      }
      return;
    }

    handler(payload);

    if (once) {
      this.off(type, handler);
    }
  }

  /**
   * 订阅一次性事件
   * @template T - 事件载荷类型
   * @param type - 事件类型
   * @param handler - 事件处理函数
   * @param options - 订阅选项
   * @returns 取消订阅函数
   */
  once<T = unknown>(
    type: string,
    handler: EventHandler<T>,
    options: { priority?: number } = {}
  ): () => void {
    let unsubscribe: () => void = () => {};

    unsubscribe = this.on(
      type,
      ((payload: unknown) => {
        unsubscribe();
        (handler as EventHandler<unknown>)(payload);
      }) as EventHandler<T>,
      options
    );

    return unsubscribe;
  }

  /**
   * 订阅所有事件（通配符）
   * @template T - 事件载荷类型
   * @param handler - 事件处理函数
   * @returns 取消订阅函数
   */
  onWildcard<T = unknown>(handler: (event: AppEvent<T>) => void): () => void {
    return this.on('*', handler as EventHandler<T>);
  }

  /**
   * 订阅指定命名空间下的所有事件
   * @template T - 事件载荷类型
   * @param namespace - 命名空间名称
   * @param handler - 事件处理函数
   * @returns 取消订阅函数
   */
  onNamespace<T = unknown>(namespace: string, handler: (event: AppEvent<T>) => void): () => void {
    return this.on(`${namespace}:*`, handler as EventHandler<T>);
  }

  /**
   * 获取事件监听器数量
   * @param type - 事件类型，不传则返回总数
   * @returns 监听器数量
   */
  listenerCount(type?: string): number {
    if (!type) {
      let total = 0;
      this.listeners.forEach((listeners) => {
        total += listeners.length;
      });
      return total;
    }
    return this.listeners.get(type)?.length ?? 0;
  }

  /**
   * 移除所有监听器
   * @param type - 事件类型，不传则移除所有
   */
  removeAllListeners(type?: string): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
      this.debounceTimers.clear();
      this.throttleTimers.clear();
    }
  }

  /**
   * 清空事件总线状态
   */
  clear(): void {
    this.removeAllListeners();
    this.eventHistory = [];
  }

  /**
   * 获取所有已注册的事件类型
   * @returns 事件类型数组
   */
  eventNames(): string[] {
    return [...this.listeners.keys()];
  }

  /**
   * 获取事件历史记录
   * @returns 事件历史数组
   */
  getHistory(): AppEvent[] {
    return [...this.eventHistory];
  }

  /**
   * 清空事件历史记录
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * 记录事件到历史（内部方法）
   */
  private recordEvent<T>(type: string, payload: T, source?: string): void {
    const event: AppEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source,
    };

    this.eventHistory.push(event);

    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /** 快捷方法：发布文件打开事件 */
  emitFileOpened(filePath: string): void {
    this.emit(AppEvents.FILE_OPENED, filePath);
  }

  /** 快捷方法：发布文件保存事件 */
  emitFileSaved(filePath: string): void {
    this.emit(AppEvents.FILE_SAVED, filePath);
  }

  /** 快捷方法：发布项目创建事件 */
  emitProjectCreated(projectPath: string): void {
    this.emit(AppEvents.PROJECT_CREATED, projectPath);
  }

  /** 快捷方法：发布编辑器文本变更事件 */
  emitEditorTextChanged(content: string): void {
    this.emit(AppEvents.EDITOR_TEXT_CHANGED, content);
  }

  /** 快捷方法：发布 AI 响应事件 */
  emitAIResponse(response: string): void {
    this.emit(AppEvents.AI_RESPONSE, response);
  }

  /** 快捷方法：发布错误事件 */
  emitError(error: Error): void {
    this.emit(AppEvents.ERROR, error);
  }

  /** 快捷方法：发布服务启动事件 */
  emitServiceStarted(serviceName: string): void {
    this.emit(AppEvents.SERVICE_STARTED, serviceName);
  }

  /** 快捷方法：发布服务停止事件 */
  emitServiceStopped(serviceName: string): void {
    this.emit(AppEvents.SERVICE_STOPPED, serviceName);
  }
}

/** 全局事件总线实例 */
export const globalEventBus = new EventBus();

/** 事件总线 Hook */
export const useEventBus = () => globalEventBus;
