import React, { useState } from 'react';
import {
  ChevronRight, ChevronDown, FolderOpen, Folder,
  FileCode2, FileText, FileJson, File, Plus, MoreHorizontal,
  RefreshCw, FileSearch, FileImage, FileAudio, FileVideo, FileArchive
} from 'lucide-react';

interface FileNode {
  name: string;
  type: 'folder' | 'file';
  language?: string;
  children?: FileNode[];
}

const fileTree: FileNode[] = [
  {
    name: 'src', type: 'folder', children: [
      { name: 'main', type: 'folder', children: [
        { name: 'index.ts', type: 'file', language: 'typescript' },
      ]},
      { name: 'preload', type: 'folder', children: [
        { name: 'index.ts', type: 'file', language: 'typescript' },
      ]},
      { name: 'renderer', type: 'folder', children: [
        { name: 'App.tsx', type: 'file', language: 'typescript' },
        { name: 'main.tsx', type: 'file', language: 'typescript' },
        { name: 'index.html', type: 'file', language: 'html' },
        { name: 'styles', type: 'folder', children: [
          { name: 'theme.css', type: 'file', language: 'css' },
        ]},
        { name: 'components', type: 'folder', children: [
          { name: 'layout', type: 'folder', children: [
            { name: 'App.tsx', type: 'file', language: 'typescript' },
            { name: 'ActivityBar.tsx', type: 'file', language: 'typescript' },
            { name: 'Sidebar.tsx', type: 'file', language: 'typescript' },
            { name: 'Editor.tsx', type: 'file', language: 'typescript' },
            { name: 'TabBar.tsx', type: 'file', language: 'typescript' },
            { name: 'Toolbar.tsx', type: 'file', language: 'typescript' },
            { name: 'BottomPanel.tsx', type: 'file', language: 'typescript' },
            { name: 'RightPanel.tsx', type: 'file', language: 'typescript' },
            { name: 'StatusBar.tsx', type: 'file', language: 'typescript' },
          ]},
          { name: 'panels', type: 'folder', children: [
            { name: 'ExplorerPanel.tsx', type: 'file', language: 'typescript' },
            { name: 'AIChatPanel.tsx', type: 'file', language: 'typescript' },
          ]},
        ]},
        { name: 'store', type: 'folder', children: [
          { name: 'useStore.ts', type: 'file', language: 'typescript' },
        ]},
        { name: 'types', type: 'folder', children: [
          { name: 'index.ts', type: 'file', language: 'typescript' },
        ]},
      ]},
      { name: 'shared', type: 'folder', children: [
        { name: 'types.ts', type: 'file', language: 'typescript' },
      ]},
    ]
  },
  {
    name: 'extensions', type: 'folder', children: [
      { name: 'git', type: 'folder' },
      { name: 'github', type: 'folder' },
    ]
  },
  { name: 'assets', type: 'folder', children: [
    { name: 'icons', type: 'folder' },
    { name: 'images', type: 'folder' },
  ]},
  { name: 'package.json', type: 'file', language: 'json' },
  { name: 'tsconfig.json', type: 'file', language: 'json' },
  { name: 'electron.vite.config.js', type: 'file', language: 'javascript' },
  { name: 'README.md', type: 'file', language: 'markdown' },
  { name: '.gitignore', type: 'file' },
  { name: 'LICENSE', type: 'file' },
];

const getFileIcon = (name: string, language?: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  
  if (language === 'typescript' || language === 'javascript' || ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
    return <FileCode2 size={15} style={{ color: '#60A5FA' }} />;
  }
  if (language === 'json' || ext === 'json') {
    return <FileJson size={15} style={{ color: '#FBBF24' }} />;
  }
  if (language === 'html' || ext === 'html') {
    return <FileCode2 size={15} style={{ color: '#F87171' }} />;
  }
  if (language === 'markdown' || ext === 'md') {
    return <FileText size={15} style={{ color: '#60A5FA' }} />;
  }
  if (language === 'css' || ext === 'css' || ext === 'scss' || ext === 'less') {
    return <FileCode2 size={15} style={{ color: '#A795E3' }} />;
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) {
    return <FileImage size={15} style={{ color: '#A795E3' }} />;
  }
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) {
    return <FileAudio size={15} style={{ color: '#F87171' }} />;
  }
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
    return <FileVideo size={15} style={{ color: '#FBBF24' }} />;
  }
  if (['zip', 'rar', 'tar', 'gz'].includes(ext || '')) {
    return <FileArchive size={15} style={{ color: '#94A3B8' }} />;
  }
  return <File size={15} style={{ color: 'var(--text-tertiary)' }} />;
};

function FileTreeNode({ node, depth, onSelect }: { node: FileNode; depth: number; onSelect?: (node: FileNode) => void }): React.ReactElement {
  const [expanded, setExpanded] = useState(depth < 1);
  const [selected, setSelected] = useState(false);

  const indent = depth * 12 + 8;

  const handleClick = () => {
    if (node.type === 'folder') {
      setExpanded(!expanded);
    }
    setSelected(!selected);
    onSelect?.(node);
  };

  if (node.type === 'folder') {
    const FolderIcon = expanded ? FolderOpen : Folder;
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div>
        <div
          className={`explorer-item ${selected ? 'explorer-item-selected' : ''}`}
          style={{ paddingLeft: indent }}
          onClick={handleClick}
        >
          <span className="explorer-chevron">
            {hasChildren ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span style={{ width: 16, display: 'inline-block' }} />}
          </span>
          <FolderIcon size={15} style={{ color: '#FBBF24', marginRight: 6, flexShrink: 0 }} />
          <span className="explorer-name explorer-name-folder">{node.name}</span>
          {node.children && (
            <span className="explorer-item-count">({node.children.length})</span>
          )}
        </div>
        {expanded && node.children?.map((child, i) => (
          <FileTreeNode key={`${child.name}-${i}`} node={child} depth={depth + 1} onSelect={onSelect} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`explorer-item explorer-file ${selected ? 'explorer-item-selected' : ''}`}
      style={{ paddingLeft: indent + 20 }}
      onClick={handleClick}
    >
      {getFileIcon(node.name, node.language)}
      <span className="explorer-name">{node.name}</span>
    </div>
  );
}

function ExplorerPanel(): React.ReactElement {
  const handleFileSelect = (node: FileNode) => {
    if (node.type === 'file') {
      console.log('Selected file:', node.name);
    }
  };

  return (
    <div className="explorer">
      <div className="explorer-header">
        <div className="explorer-header-left">
          <span className="panel-header-title">
            <FolderOpen size={14} style={{ color: 'var(--color-accent)' }} />
            资源管理器
          </span>
        </div>
        <div className="explorer-header-actions">
          <button className="btn-icon btn-icon-primary" title="新建文件">
            <Plus size={14} />
          </button>
          <button className="btn-icon" title="刷新">
            <RefreshCw size={14} />
          </button>
          <button className="btn-icon" title="更多操作">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      <div className="explorer-section">
        <div className="explorer-section-header">
          <span className="explorer-section-name">MYCODE-AI</span>
          <div className="explorer-section-actions">
            <button className="btn-icon btn-icon-sm" title="展开全部">
              <ChevronDown size={12} />
            </button>
            <button className="btn-icon btn-icon-sm" title="折叠全部">
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
        <div className="explorer-tree">
          {fileTree.map((node, i) => (
            <FileTreeNode key={`${node.name}-${i}`} node={node} depth={0} onSelect={handleFileSelect} />
          ))}
        </div>
      </div>
      <div className="explorer-footer">
        <div className="explorer-footer-item">
          <FileSearch size={12} />
          <span>搜索文件</span>
        </div>
      </div>

      <style>{`
        .explorer {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-secondary);
        }
        .explorer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2) var(--space-3);
          height: 36px;
          min-height: 36px;
          flex-shrink: 0;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-subtle);
        }
        .explorer-header-left {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .explorer-header-actions {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .btn-icon {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-xs);
          transition: all var(--duration-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-icon:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .btn-icon-primary {
          color: var(--text-primary);
        }
        .btn-icon-primary:hover {
          background: var(--color-accent-bg);
          color: var(--color-accent);
        }
        .btn-icon-sm {
          padding: 2px;
        }
        .explorer-section {
          flex: 1;
          overflow-y: auto;
          padding-bottom: var(--space-4);
        }
        .explorer-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2) var(--space-3);
          position: sticky;
          top: 0;
          z-index: 1;
          background: var(--bg-secondary);
          backdrop-filter: blur(8px);
        }
        .explorer-section-name {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-tertiary);
        }
        .explorer-section-actions {
          display: flex;
          gap: 2px;
        }
        .explorer-tree {
          display: flex;
          flex-direction: column;
        }
        .explorer-item {
          display: flex;
          align-items: center;
          height: 26px;
          padding-right: var(--space-3);
          cursor: pointer;
          transition: background var(--duration-instant) var(--ease-out);
          user-select: none;
          gap: var(--space-1);
          position: relative;
        }
        .explorer-item:hover {
          background: var(--sidebar-item-hover);
        }
        .explorer-item-selected {
          background: var(--bg-active) !important;
        }
        .explorer-item-selected .explorer-name {
          color: var(--text-inverse) !important;
        }
        .explorer-file:hover {
          border-radius: var(--sidebar-item-radius);
        }
        .explorer-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          color: var(--text-muted);
          transition: transform var(--duration-fast);
        }
        .explorer-name {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        .explorer-name-folder {
          font-weight: 500;
        }
        .explorer-item:hover .explorer-name {
          color: var(--text-primary);
        }
        .explorer-item-count {
          font-size: 11px;
          color: var(--text-muted);
          margin-left: 4px;
          flex-shrink: 0;
        }
        .explorer-footer {
          padding: var(--space-2);
          border-top: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        .explorer-footer-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background var(--duration-fast);
        }
        .explorer-footer-item:hover {
          background: var(--bg-hover);
        }
        .explorer-footer-item span {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
        }
        .explorer-footer-item:hover span {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

export default ExplorerPanel;