export interface Panel {
  id: string;
  name: string;
  icon: string;
  category: 'sidebar' | 'bottom' | 'right';
  defaultOpen?: boolean;
}

export interface Tab {
  id: string;
  title: string;
  path?: string;
  language?: string;
  content?: string;
  modified?: boolean;
  hasErrors?: boolean;
  isGitModified?: boolean;
}

export interface LayoutState {
  activeSidebarPanel: string;
  activeBottomPanel: string;
  activeRightPanel: string;
  bottomPanelHeight: number;
  rightPanelWidth: number;
  sidebarWidth: number;
  isBottomPanelVisible: boolean;
  isRightPanelVisible: boolean;
}

export interface EditorState {
  tabs: Tab[];
  activeTabId: string | null;
}

export interface AISession {
  id: string;
  messages: AIMessage[];
  title: string;
  createdAt: Date;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type ActivityBarItem = {
  id: string;
  icon: string;
  label: string;
  panelId?: string;
};