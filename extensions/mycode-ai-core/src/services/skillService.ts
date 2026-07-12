export type SkillType = 'descriptor' | 'clawhub' | 'mcp' | 'quickstart';

export type SkillCapability =
  | 'context-injection'
  | 'command-injection'
  | 'executable-tool'
  | 'external-tool';

export interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  type: SkillType;
  enabled: boolean;
  icon?: string;
  author?: string;
  capabilities: SkillCapability[];
  categories?: string[];
  tags?: string[];
  lastUpdated?: string;
  installTime?: number;
  language?: 'python' | 'nodejs' | 'markdown';
  envVars?: SkillEnvVar[];
  mcpConfig?: MCPConfig;
}

export interface SkillEnvVar {
  key: string;
  value: string;
  description?: string;
  required?: boolean;
}

export interface MCPConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
}

export interface ClawHubSkill {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  rating: number;
  downloadCount: number;
  categories: string[];
  tags: string[];
  lastUpdated: string;
  capabilities: SkillCapability[];
}

export class SkillService {
  private skills: Skill[] = [];
  private clawhubSkills: ClawHubSkill[] = [];
  private listeners: Set<(event: { type: string; payload?: any }) => void> = new Set();

  constructor() {
    this.loadSkills();
    this.loadClawHubSkills();
  }

  private loadSkills(): void {
    this.skills = [
      {
        id: 'code-assistant',
        name: '代码助手',
        version: '1.0.0',
        description: '提供代码解释、重构建议和错误修复等 AI 辅助功能',
        type: 'descriptor',
        enabled: true,
        author: 'MyCode AI',
        capabilities: ['context-injection', 'command-injection'],
        categories: ['开发', '代码'],
        tags: ['代码', '助手', '重构'],
        lastUpdated: '2026-06-30',
        installTime: Date.now(),
        language: 'markdown',
      },
      {
        id: 'git-helper',
        name: 'Git 助手',
        version: '1.2.0',
        description: '智能 Git 操作助手，支持提交信息生成、分支管理建议',
        type: 'descriptor',
        enabled: true,
        author: 'MyCode AI',
        capabilities: ['command-injection'],
        categories: ['开发', 'Git'],
        tags: ['Git', '版本控制'],
        lastUpdated: '2026-06-28',
        installTime: Date.now() - 86400000,
        language: 'markdown',
      },
      {
        id: 'github-mcp',
        name: 'GitHub MCP 服务器',
        version: '2.0.0',
        description: '通过 Model Context Protocol 接入 GitHub API，管理仓库、Issue 和 PR',
        type: 'mcp',
        enabled: false,
        author: 'GitHub',
        capabilities: ['external-tool'],
        categories: ['开发', 'MCP'],
        tags: ['GitHub', 'MCP', 'API'],
        lastUpdated: '2026-06-25',
        installTime: Date.now() - 172800000,
        mcpConfig: {
          command: 'npx',
          args: ['@modelcontextprotocol/server-github'],
          env: { GITHUB_TOKEN: '' },
        },
        envVars: [
          {
            key: 'GITHUB_TOKEN',
            value: '',
            description: 'GitHub Personal Access Token',
            required: true,
          },
        ],
      },
      {
        id: 'filesystem-mcp',
        name: '文件系统 MCP',
        version: '1.5.0',
        description: '本地文件系统 MCP 服务器，安全的文件读写操作',
        type: 'mcp',
        enabled: true,
        author: 'MCP Team',
        capabilities: ['external-tool'],
        categories: ['工具', 'MCP'],
        tags: ['文件', 'MCP', '本地'],
        lastUpdated: '2026-06-20',
        installTime: Date.now() - 259200000,
        mcpConfig: {
          command: 'npx',
          args: ['@modelcontextprotocol/server-filesystem', '.'],
        },
      },
    ];
  }

  private loadClawHubSkills(): void {
    this.clawhubSkills = [
      {
        id: 'python-runner',
        name: 'Python 运行器',
        version: '1.3.0',
        description: '在对话中直接执行 Python 代码，支持数据处理和脚本运行',
        author: 'ClawHub',
        rating: 4.8,
        downloadCount: 15420,
        categories: ['开发', 'Python'],
        tags: ['Python', '执行', '数据'],
        lastUpdated: '2026-06-29',
        capabilities: ['executable-tool'],
      },
      {
        id: 'nodejs-runner',
        name: 'Node.js 运行器',
        version: '1.2.5',
        description: '在对话中执行 JavaScript/TypeScript 代码',
        author: 'ClawHub',
        rating: 4.7,
        downloadCount: 12350,
        categories: ['开发', 'Node.js'],
        tags: ['JavaScript', 'Node.js', '执行'],
        lastUpdated: '2026-06-28',
        capabilities: ['executable-tool'],
      },
      {
        id: 'database-explorer',
        name: '数据库浏览器',
        version: '2.1.0',
        description: '连接和浏览 MySQL、PostgreSQL、SQLite 等数据库',
        author: 'db-tools',
        rating: 4.6,
        downloadCount: 8920,
        categories: ['数据库', '工具'],
        tags: ['数据库', 'SQL', 'MySQL'],
        lastUpdated: '2026-06-25',
        capabilities: ['executable-tool', 'external-tool'],
      },
      {
        id: 'api-tester',
        name: 'API 测试器',
        version: '1.4.0',
        description: 'REST API 测试工具，支持 GET/POST/PUT/DELETE 请求',
        author: 'api-dev',
        rating: 4.5,
        downloadCount: 7650,
        categories: ['开发', 'API'],
        tags: ['API', 'REST', 'HTTP'],
        lastUpdated: '2026-06-24',
        capabilities: ['executable-tool'],
      },
      {
        id: 'markdown-preview',
        name: 'Markdown 预览',
        version: '1.1.0',
        description: '实时预览 Markdown 文档，支持导出 HTML/PDF',
        author: 'doc-tools',
        rating: 4.4,
        downloadCount: 6230,
        categories: ['文档', '工具'],
        tags: ['Markdown', '预览', '文档'],
        lastUpdated: '2026-06-20',
        capabilities: ['context-injection'],
      },
      {
        id: 'regex-helper',
        name: '正则表达式助手',
        version: '1.0.5',
        description: '智能正则表达式生成、解释和测试工具',
        author: 'regex-dev',
        rating: 4.9,
        downloadCount: 18900,
        categories: ['开发', '工具'],
        tags: ['正则', 'Regex', '文本处理'],
        lastUpdated: '2026-06-30',
        capabilities: ['command-injection'],
      },
      {
        id: 'json-formatter',
        name: 'JSON 格式化',
        version: '1.2.0',
        description: 'JSON 格式化、压缩、验证和对比工具',
        author: 'json-tools',
        rating: 4.3,
        downloadCount: 5420,
        categories: ['开发', '工具'],
        tags: ['JSON', '格式化', '验证'],
        lastUpdated: '2026-06-15',
        capabilities: ['executable-tool'],
      },
      {
        id: 'color-picker',
        name: '颜色选择器',
        version: '1.0.0',
        description: '颜色选择和转换工具，支持 HEX/RGB/HSL 互转',
        author: 'design-tools',
        rating: 4.2,
        downloadCount: 4180,
        categories: ['设计', '工具'],
        tags: ['颜色', '设计', 'CSS'],
        lastUpdated: '2026-06-10',
        capabilities: ['command-injection'],
      },
    ];
  }

  subscribe(listener: (event: { type: string; payload?: any }) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: { type: string; payload?: any }): void {
    this.listeners.forEach((listener) => listener(event));
  }

  getAllSkills(): Skill[] {
    return [...this.skills];
  }

  getSkillsByType(type: SkillType): Skill[] {
    return this.skills.filter((s) => s.type === type);
  }

  getEnabledSkills(): Skill[] {
    return this.skills.filter((s) => s.enabled);
  }

  getSkillById(id: string): Skill | undefined {
    return this.skills.find((s) => s.id === id);
  }

  toggleSkill(id: string): boolean {
    const skill = this.skills.find((s) => s.id === id);
    if (skill) {
      skill.enabled = !skill.enabled;
      this.emit({ type: 'skillToggled', payload: skill });
      return skill.enabled;
    }
    return false;
  }

  installSkill(clawhubSkill: ClawHubSkill): Skill {
    const newSkill: Skill = {
      id: clawhubSkill.id,
      name: clawhubSkill.name,
      version: clawhubSkill.version,
      description: clawhubSkill.description,
      type: 'clawhub',
      enabled: true,
      author: clawhubSkill.author,
      capabilities: clawhubSkill.capabilities,
      categories: clawhubSkill.categories,
      tags: clawhubSkill.tags,
      lastUpdated: clawhubSkill.lastUpdated,
      installTime: Date.now(),
    };
    this.skills.push(newSkill);
    this.emit({ type: 'skillInstalled', payload: newSkill });
    return newSkill;
  }

  uninstallSkill(id: string): boolean {
    const index = this.skills.findIndex((s) => s.id === id);
    if (index !== -1) {
      const removed = this.skills.splice(index, 1)[0];
      this.emit({ type: 'skillUninstalled', payload: removed });
      return true;
    }
    return false;
  }

  searchClawHub(query: string): ClawHubSkill[] {
    if (!query.trim()) return [...this.clawhubSkills];
    const lowerQuery = query.toLowerCase();
    return this.clawhubSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        s.author.toLowerCase().includes(lowerQuery) ||
        s.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }

  getAllClawHubSkills(): ClawHubSkill[] {
    return [...this.clawhubSkills];
  }

  isSkillInstalled(skillId: string): boolean {
    return this.skills.some((s) => s.id === skillId);
  }

  updateSkillEnvVars(id: string, envVars: SkillEnvVar[]): boolean {
    const skill = this.skills.find((s) => s.id === id);
    if (skill) {
      skill.envVars = envVars;
      this.emit({ type: 'skillUpdated', payload: skill });
      return true;
    }
    return false;
  }

  getQuickStartGuides(): Skill[] {
    return [
      {
        id: 'quickstart-intro',
        name: '技能入门指南',
        version: '1.0.0',
        description: '了解什么是技能，如何安装和使用技能扩展编辑器能力',
        type: 'quickstart',
        enabled: true,
        author: 'MyCode AI',
        capabilities: [],
        categories: ['入门'],
        tags: ['入门', '指南'],
        lastUpdated: '2026-07-01',
      },
      {
        id: 'quickstart-create',
        name: '创建你的第一个技能',
        version: '1.0.0',
        description: '从零开始创建一个描述符技能，学习技能开发基础',
        type: 'quickstart',
        enabled: true,
        author: 'MyCode AI',
        capabilities: [],
        categories: ['开发'],
        tags: ['开发', '教程'],
        lastUpdated: '2026-07-01',
      },
      {
        id: 'quickstart-mcp',
        name: 'MCP 服务器接入指南',
        version: '1.0.0',
        description: '学习如何通过 Model Context Protocol 接入外部工具',
        type: 'quickstart',
        enabled: true,
        author: 'MyCode AI',
        capabilities: [],
        categories: ['MCP'],
        tags: ['MCP', '工具', 'API'],
        lastUpdated: '2026-07-01',
      },
      {
        id: 'quickstart-best-practices',
        name: '技能开发最佳实践',
        version: '1.0.0',
        description: '技能开发中的最佳实践和常见问题解答',
        type: 'quickstart',
        enabled: true,
        author: 'MyCode AI',
        capabilities: [],
        categories: ['开发'],
        tags: ['最佳实践', 'FAQ'],
        lastUpdated: '2026-07-01',
      },
    ];
  }

  getSkillCountByType(): Record<SkillType, number> {
    return {
      descriptor: this.skills.filter((s) => s.type === 'descriptor').length,
      clawhub: this.skills.filter((s) => s.type === 'clawhub').length,
      mcp: this.skills.filter((s) => s.type === 'mcp').length,
      quickstart: 0,
    };
  }
}

export const skillService = new SkillService();
