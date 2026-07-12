import React, { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { FileCode2, FileText, FileJson, File, X, GitBranch, AlertCircle, ChevronDown } from 'lucide-react';

function TabBar(): React.ReactElement {
  const { tabs, activeTabId, setActiveTab, closeTab, reorderTabs } = useStore();
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [closingTabId, setClosingTabId] = useState<string | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  const getFileIcon = (language: string) => {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return <FileCode2 size={14} style={{ color: '#60A5FA' }} />;
      case 'json':
        return <FileJson size={14} style={{ color: '#FBBF24' }} />;
      case 'html':
        return <FileCode2 size={14} style={{ color: '#F87171' }} />;
      case 'markdown':
        return <FileText size={14} style={{ color: '#60A5FA' }} />;
      default:
        return <File size={14} style={{ color: 'var(--text-tertiary)' }} />;
    }
  };

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTabId(tabId);
  };

  const handleDragLeave = () => {
    setDragOverTabId(null);
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    if (draggedTabId && draggedTabId !== targetTabId) {
      reorderTabs(draggedTabId, targetTabId);
    }
    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    setClosingTabId(tabId);
    setTimeout(() => {
      closeTab(tabId);
      setClosingTabId(null);
    }, 150);
  };

  return (
    <div className="tabbar" ref={tabBarRef}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tabbar-tab ${activeTabId === tab.id ? 'tabbar-tab-active' : ''} ${draggedTabId === tab.id ? 'tabbar-tab-dragging' : ''} ${dragOverTabId === tab.id ? 'tabbar-tab-drag-over' : ''} ${closingTabId === tab.id ? 'tabbar-tab-closing' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          draggable
          onDragStart={(e) => handleDragStart(e, tab.id)}
          onDragOver={(e) => handleDragOver(e, tab.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, tab.id)}
          onDragEnd={handleDragEnd}
        >
          <span className="tabbar-tab-icon">
            {getFileIcon(tab.language || '')}
          </span>
          <span className="tabbar-tab-title">{tab.title}</span>
          {tab.modified && <span className="tabbar-tab-modified-dot" />}
          {tab.hasErrors && (
            <span className="tabbar-tab-error">
              <AlertCircle size={11} />
            </span>
          )}
          {tab.isGitModified && (
            <span className="tabbar-tab-git">
              <GitBranch size={11} />
            </span>
          )}
          <button
            className="tabbar-tab-close"
            onClick={(e) => handleCloseTab(e, tab.id)}
            title="关闭标签"
          >
            <X size={12} />
          </button>
        </div>
      ))}
      {tabs.length === 0 && (
        <div className="tabbar-empty">
          <span>打开文件开始编辑</span>
        </div>
      )}
      {tabs.length > 0 && (
        <button className="tabbar-more-btn" title="更多标签">
          <ChevronDown size={14} />
        </button>
      )}

      <style>{`
        .tabbar {
          height: var(--tabbar-height);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: flex-end;
          overflow-x: auto;
          overflow-y: hidden;
          padding-left: 4px;
          flex-shrink: 0;
          position: relative;
        }
        .tabbar::-webkit-scrollbar {
          height: 0;
        }
        .tabbar-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: var(--text-tertiary);
          font-size: var(--font-size-sm);
        }
        .tabbar-tab {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          min-width: 100px;
          max-width: 220px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          border-bottom: none;
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          margin-right: 2px;
          cursor: pointer;
          transition: all var(--duration-fast);
          color: var(--text-secondary);
          position: relative;
        }
        .tabbar-tab:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .tabbar-tab-active {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-color: var(--border-strong);
          border-top: 1px solid var(--color-accent);
        }
        .tabbar-tab-active .tabbar-tab-icon {
          transform: scale(1.05);
        }
        .tabbar-tab-dragging {
          opacity: 0.5;
          transform: scale(0.95);
          box-shadow: var(--shadow-md);
        }
        .tabbar-tab-drag-over {
          border-left: 2px solid var(--color-accent);
        }
        .tabbar-tab-closing {
          animation: fadeOutTab var(--duration-fast) var(--ease-out) forwards;
        }
        .tabbar-tab-icon {
          flex-shrink: 0;
          transition: transform var(--duration-fast);
        }
        .tabbar-tab-title {
          flex: 1;
          margin-left: 6px;
          font-size: var(--font-size-sm);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tabbar-tab-modified-dot {
          width: 8px;
          height: 8px;
          background: var(--color-accent);
          border-radius: 50%;
          margin-left: 4px;
          flex-shrink: 0;
        }
        .tabbar-tab-error {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
          flex-shrink: 0;
          color: var(--color-error);
        }
        .tabbar-tab-git {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
          flex-shrink: 0;
          color: var(--color-success);
        }
        .tabbar-tab-close {
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 2px;
          margin-left: 4px;
          border-radius: var(--radius-xs);
          opacity: 0;
          transition: all var(--duration-fast);
          flex-shrink: 0;
        }
        .tabbar-tab:hover .tabbar-tab-close,
        .tabbar-tab-active .tabbar-tab-close {
          opacity: 1;
        }
        .tabbar-tab-close:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .tabbar-more-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 28px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius-sm);
          margin-left: 2px;
          transition: all var(--duration-fast);
        }
        .tabbar-more-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        @keyframes fadeOutTab {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
            max-width: 220px;
          }
          to {
            opacity: 0;
            transform: translateX(-10px) scale(0.9);
            max-width: 0;
            padding: 0;
            margin: 0;
            border-width: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default TabBar;