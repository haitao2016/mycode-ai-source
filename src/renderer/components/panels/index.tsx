import React from 'react';
import ExplorerPanel from './ExplorerPanel';
import SearchPanel from './SearchPanel';
import GitPanel from './GitPanel';
import ExtensionsPanel from './ExtensionsPanel';
import AIChatPanel from './AIChatPanel';
import AIPanel from './AIPanel';
import AgentPanel from './AgentPanel';
import AssetPanel from './AssetPanel';
import AuditLogPanel from './AuditLogPanel';
import BasePanel from './BasePanel';
import BlockEditorPanel from './BlockEditorPanel';
import BuildPanel from './BuildPanel';
import CanvasPanel from './CanvasPanel';
import CapabilityCardPanel from './CapabilityCardPanel';
import CMakePanel from './CMakePanel';
import CodeAnalysisPanel from './CodeAnalysisPanel';
import CodeCoveragePanel from './CodeCoveragePanel';
import CodeReviewPanel from './CodeReviewPanel';
import CollaborationPanel from './CollaborationPanel';
import ComposerPanel from './ComposerPanel';
import CostTrackingPanel from './CostTrackingPanel';
import CueProPanel from './CueProPanel';
import CustomizePanel from './CustomizePanel';
import DatabaseViewPanel from './DatabaseViewPanel';
import DebugPanel from './DebugPanel';
import DebugConsolePanel from './DebugConsolePanel';
import DevEnvPanel from './DevEnvPanel';
import FormPanel from './FormPanel';
import GitLensPanel from './GitLensPanel';
import GitOutputPanel from './GitOutputPanel';
import KnowledgeBasePanel from './KnowledgeBasePanel';
import LocalModelPanel from './LocalModelPanel';
import LowCodePanel from './LowCodePanel';
import MemoryLeakPanel from './MemoryLeakPanel';
import MemoryPanel from './MemoryPanel';
import MeetingNotesPanel from './MeetingNotesPanel';
import NotionWorkspacePanel from './NotionWorkspacePanel';
import OutputPanel from './OutputPanel';
import OutlinePanel from './OutlinePanel';
import PerformancePanel from './PerformancePanel';
import PlanPanel from './PlanPanel';
import PluginsPanel from './PluginsPanel';
import PreviewPanel from './PreviewPanel';
import PreviewPanel2 from './PreviewPanel2';
import ProblemsPanel from './ProblemsPanel';
import ProjectPanel from './ProjectPanel';
import PropertiesPanel from './PropertiesPanel';
import ProviderPanel from './ProviderPanel';
import PublishPanel from './PublishPanel';
import ReferencesPanel from './ReferencesPanel';
import RefactorPanel from './RefactorPanel';
import RemoteDebugPanel from './RemoteDebugPanel';
import RouterPanel from './RouterPanel';
import SdkPanel from './SdkPanel';
import SemanticSearchPanel from './SemanticSearchPanel';
import SkillPanel from './SkillPanel';
import SnippetPanel from './SnippetPanel';
import TapTapPanel from './TapTapPanel';
import TemplateGalleryPanel from './TemplateGalleryPanel';
import TerminalPanel from './TerminalPanel';
import TestPanel from './TestPanel';
import ThemeMarketPanel from './ThemeMarketPanel';
import TokenOptimizerPanel from './TokenOptimizerPanel';
import UniversalSearchPanel from './UniversalSearchPanel';
import VariableWatchPanel from './VariableWatchPanel';
import VibeCodingPanel from './VibeCodingPanel';
import WorkspacePanel from './WorkspacePanel';

export interface PanelComponent {
  id: string;
  component: React.ComponentType;
}

export const panelComponents: Record<string, React.ComponentType> = {
  explorer: ExplorerPanel,
  search: SearchPanel,
  git: GitPanel,
  extensions: ExtensionsPanel,
  'ai-chat': AIChatPanel,
  'ai-panel': AIPanel,
  agent: AgentPanel,
  asset: AssetPanel,
  audit: AuditLogPanel,
  block: BlockEditorPanel,
  build: BuildPanel,
  canvas: CanvasPanel,
  capability: CapabilityCardPanel,
  cmake: CMakePanel,
  'code-analysis': CodeAnalysisPanel,
  'code-coverage': CodeCoveragePanel,
  'code-review': CodeReviewPanel,
  collaboration: CollaborationPanel,
  composer: ComposerPanel,
  cost: CostTrackingPanel,
  cue: CueProPanel,
  customize: CustomizePanel,
  database: DatabaseViewPanel,
  'debug-panel': DebugPanel,
  'debug-console': DebugConsolePanel,
  'dev-env': DevEnvPanel,
  form: FormPanel,
  'git-lens': GitLensPanel,
  'git-output': GitOutputPanel,
  knowledge: KnowledgeBasePanel,
  local: LocalModelPanel,
  lowcode: LowCodePanel,
  'memory-leak': MemoryLeakPanel,
  memory: MemoryPanel,
  meeting: MeetingNotesPanel,
  notion: NotionWorkspacePanel,
  output: OutputPanel,
  outline: OutlinePanel,
  performance: PerformancePanel,
  plan: PlanPanel,
  plugins: PluginsPanel,
  preview: PreviewPanel,
  'preview-panel': PreviewPanel2,
  problems: ProblemsPanel,
  project: ProjectPanel,
  properties: PropertiesPanel,
  provider: ProviderPanel,
  publish: PublishPanel,
  references: ReferencesPanel,
  refactor: RefactorPanel,
  'remote-debug': RemoteDebugPanel,
  router: RouterPanel,
  api: SdkPanel,
  semantic: SemanticSearchPanel,
  skill: SkillPanel,
  snippet: SnippetPanel,
  tap: TapTapPanel,
  template: TemplateGalleryPanel,
  terminal: TerminalPanel,
  test: TestPanel,
  theme: ThemeMarketPanel,
  token: TokenOptimizerPanel,
  universal: UniversalSearchPanel,
  variable: VariableWatchPanel,
  vibe: VibeCodingPanel,
  workspace: WorkspacePanel,
};

export const getPanelComponent = (panelId: string): React.ComponentType | null => {
  return panelComponents[panelId] || null;
};