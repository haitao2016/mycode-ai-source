import { create } from 'zustand';
import { LayoutState, EditorState, Panel, Tab, AISession } from '../types';
interface AppState extends LayoutState, EditorState {
 panels: Panel[];
 aiSessions: AISession[];
 activeAISessionId: string | null;
 setActiveSidebarPanel: (panelId: string) => void;
 setActiveBottomPanel: (panelId: string) => void;
 setActiveRightPanel: (panelId: string) => void;
 toggleBottomPanel: () => void;
 toggleRightPanel: () => void;
 setBottomPanelHeight: (height: number) => void;
 setRightPanelWidth: (width: number) => void;
 setSidebarWidth: (width: number) => void;
 addTab: (tab: Omit<Tab, 'id'>) => void;
 closeTab: (tabId: string) => void;
 setActiveTab: (tabId: string) => void;
 updateTabContent: (tabId: string, content: string) => void;
 reorderTabs: (fromId: string, toId: string) => void;
 createAISession: () => string;
 setActiveAISession: (sessionId: string | null) => void;
 addAIMessage: (sessionId: string, content: string, role: 'user' | 'assistant') => void;
}
const defaultTabs: Tab[] = [
 { id: '1', title: 'main.ts', path: 'src/main.ts', language: 'typescript', content: 'console.log("Hello, MyCode AI!");' },
 { id: '2', title: 'index.html', path: 'src/index.html', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n <title>MyCode AI</title>\n</head>\n<body>\n <div id="root"></div>\n</body>\n</html>' },
];
const panels: Panel[] = [
 { id: 'explorer', name: '资源管理器', icon: 'folder', category: 'sidebar', defaultOpen: true },
 { id: 'search', name: '搜索', icon: 'search', category: 'sidebar' },
 { id: 'git', name: '源代码管理', icon: 'git', category: 'sidebar' },
 { id: 'extensions', name: '扩展', icon: 'extension', category: 'sidebar' },
 { id: 'ai-chat', name: 'AI 聊天', icon: 'message', category: 'sidebar' },
 { id: 'output', name: '输出', icon: 'output', category: 'bottom', defaultOpen: true },
 { id: 'terminal', name: '终端', icon: 'terminal', category: 'bottom' },
 { id: 'problems', name: '问题', icon: 'alert', category: 'bottom' },
 { id: 'debug', name: '调试控制台', icon: 'bug', category: 'bottom' },
 { id: 'git-output', name: 'Git 输出', icon: 'git', category: 'bottom' },
 { id: 'ai-panel', name: 'AI 面板', icon: 'sparkles', category: 'right', defaultOpen: true },
 { id: 'properties', name: '属性', icon: 'settings', category: 'right' },
 { id: 'outline', name: '大纲', icon: 'list', category: 'right' },
 { id: 'test', name: '测试', icon: 'check', category: 'right' },
 { id: 'preview', name: '预览', icon: 'eye', category: 'right' },
 { id: 'build', name: '构建', icon: 'hammer', category: 'right' },
 { id: 'performance', name: '性能', icon: 'activity', category: 'right' },
 { id: 'composer', name: 'Composer', icon: 'music', category: 'right' },
 { id: 'code-review', name: '代码审查', icon: 'code', category: 'right' },
 { id: 'refactor', name: '重构', icon: 'refresh', category: 'right' },
 { id: 'skill', name: '技能', icon: 'zap', category: 'right' },
 { id: 'memory', name: '记忆', icon: 'brain', category: 'right' },
 { id: 'agent', name: '代理', icon: 'bot', category: 'right' },
 { id: 'asset', name: '资源', icon: 'image', category: 'right' },
 { id: 'cost', name: '费用', icon: 'dollar', category: 'right' },
 { id: 'token', name: 'Token', icon: 'coins', category: 'right' },
 { id: 'audit', name: '审计', icon: 'shield', category: 'right' },
 { id: 'project', name: '项目', icon: 'folder-open', category: 'right' },
 { id: 'workspace', name: '工作区', icon: 'grid', category: 'right' },
 { id: 'database', name: '数据库', icon: 'database', category: 'right' },
 { id: 'lowcode', name: '低代码', icon: 'blocks', category: 'right' },
 { id: 'form', name: '表单', icon: 'form', category: 'right' },
 { id: 'plan', name: '计划', icon: 'calendar', category: 'right' },
 { id: 'task', name: '任务', icon: 'check-circle', category: 'right' },
 { id: 'meeting', name: '会议', icon: 'video', category: 'right' },
 { id: 'knowledge', name: '知识库', icon: 'book', category: 'right' },
 { id: 'notion', name: 'Notion', icon: 'notion', category: 'right' },
 { id: 'local', name: '本地模型', icon: 'cpu', category: 'right' },
 { id: 'provider', name: '提供商', icon: 'cloud', category: 'right' },
 { id: 'publish', name: '发布', icon: 'upload', category: 'right' },
 { id: 'theme', name: '主题', icon: 'palette', category: 'right' },
 { id: 'plugins', name: '插件', icon: 'plugin', category: 'right' },
 { id: 'customize', name: '自定义', icon: 'settings-2', category: 'right' },
 { id: 'debug-panel', name: '调试', icon: 'bug-2', category: 'right' },
 { id: 'remote-debug', name: '远程调试', icon: 'remote', category: 'right' },
 { id: 'preview-panel', name: '预览', icon: 'eye-2', category: 'right' },
 { id: 'canvas', name: '画布', icon: 'canvas', category: 'right' },
 { id: 'block', name: '块编辑器', icon: 'block', category: 'right' },
 { id: 'semantic', name: '语义搜索', icon: 'search-2', category: 'right' },
 { id: 'universal', name: '通用搜索', icon: 'search-3', category: 'right' },
 { id: 'api', name: 'API', icon: 'api', category: 'right' },
 { id: 'router', name: '路由', icon: 'route', category: 'right' },
 { id: 'template', name: '模板', icon: 'template', category: 'right' },
 { id: 'snippet', name: '代码片段', icon: 'snippet', category: 'right' },
 { id: 'variable', name: '变量', icon: 'variable', category: 'right' },
 { id: 'code-coverage', name: '代码覆盖率', icon: 'coverage', category: 'right' },
 { id: 'code-analysis', name: '代码分析', icon: 'analysis', category: 'right' },
 { id: 'collaboration', name: '协作', icon: 'users', category: 'right' },
 { id: 'cue', name: 'Cue', icon: 'cue', category: 'right' },
 { id: 'tap', name: 'Tap', icon: 'tap', category: 'right' },
 { id: 'vibe', name: 'Vibe', icon: 'vibe', category: 'right' },
 { id: 'cmake', name: 'CMake', icon: 'cmake', category: 'right' },
 { id: 'capability', name: '能力', icon: 'capability', category: 'right' },
 { id: 'dev-env', name: '开发环境', icon: 'env', category: 'right' },
 { id: 'memory-leak', name: '内存泄漏', icon: 'leak', category: 'right' },
];
export const useStore = create<AppState>((set) => ({
 activeSidebarPanel: 'explorer',
 activeBottomPanel: 'output',
 activeRightPanel: 'ai-panel',
 bottomPanelHeight: 200,
 rightPanelWidth: 400,
 sidebarWidth: 220,
 isBottomPanelVisible: true,
 isRightPanelVisible: true,
 tabs: defaultTabs,
 activeTabId: '1',
 panels,
 aiSessions: [],
 activeAISessionId: null,
 setActiveSidebarPanel: (panelId) => set({ activeSidebarPanel: panelId }),
 setActiveBottomPanel: (panelId) => set({ activeBottomPanel: panelId }),
 setActiveRightPanel: (panelId) => set({ activeRightPanel: panelId }),
 toggleBottomPanel: () => set((state) => ({ isBottomPanelVisible: !state.isBottomPanelVisible })),
 toggleRightPanel: () => set((state) => ({ isRightPanelVisible: !state.isRightPanelVisible })),
 setBottomPanelHeight: (height) => set({ bottomPanelHeight: height }),
 setRightPanelWidth: (width) => set({ rightPanelWidth: width }),
 setSidebarWidth: (width) => set({ sidebarWidth: width }),
 addTab: (tab) => set((state) => {
 const id = Date.now().toString();
 return { tabs: [...state.tabs, { ...tab, id }], activeTabId: id };
 }),
 closeTab: (tabId) => set((state) => {
 const newTabs = state.tabs.filter((t) => t.id !== tabId);
 let newActiveId = state.activeTabId;
 if (state.activeTabId === tabId) {
 newActiveId = newTabs.length > 0 ? newTabs[0].id : null;
 }
 return { tabs: newTabs, activeTabId: newActiveId };
 }),
 setActiveTab: (tabId) => set({ activeTabId: tabId }),
 updateTabContent: (tabId, content) => set((state) => ({
 tabs: state.tabs.map((t) => t.id === tabId ? { ...t, content } : t),
})),
reorderTabs: (fromId, toId) => set((state) => {
 const fromIndex = state.tabs.findIndex((t) => t.id === fromId);
 const toIndex = state.tabs.findIndex((t) => t.id === toId);
 if (fromIndex === -1 || toIndex === -1) return state;
 const newTabs = [...state.tabs];
 const [removed] = newTabs.splice(fromIndex, 1);
 newTabs.splice(toIndex, 0, removed);
 return { tabs: newTabs };
}),
createAISession: () => {
 const id = Date.now().toString();
 set((state) => ({
 aiSessions: [...state.aiSessions, {
 id,
 messages: [],
 title: `会话 ${state.aiSessions.length + 1}`,
 createdAt: new Date(),
 }],
 activeAISessionId: id,
 }));
 return id;
 },
 setActiveAISession: (sessionId) => set({ activeAISessionId: sessionId }),
 addAIMessage: (sessionId, content, role) => set((state) => ({
 aiSessions: state.aiSessions.map((session) => session.id === sessionId
 ? {
 ...session,
 messages: [...session.messages, {
 id: Date.now().toString(),
 role,
 content,
 timestamp: new Date(),
 }],
 }
 : session),
 })),
}));
export { panels };