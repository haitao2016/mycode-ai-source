import React, { useState, useEffect, useRef } from 'react';
import {
  File, Edit, View, Terminal, Search,
  Save, Undo, Redo, Scissors, Copy, Clipboard, Settings,
  FolderOpen, FileText, ArrowRight, Play, Square,
  Bug, GitBranch, GitCommit, ArrowUp, ArrowDown,
  MoreVertical, RefreshCw, Maximize2, Minimize2, ArrowRightCircle, Rocket
} from 'lucide-react';

function Toolbar(): React.ReactElement {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = {
    file: [
      { icon: FolderOpen, label: '打开文件夹', shortcut: 'Ctrl+K Ctrl+O' },
      { icon: FileText, label: '新建文件', shortcut: 'Ctrl+N' },
      { icon: File, label: '新建窗口', shortcut: 'Ctrl+Shift+N' },
      { type: 'divider' },
      { icon: Save, label: '保存', shortcut: 'Ctrl+S' },
      { icon: File, label: '另存为', shortcut: 'Ctrl+Shift+S' },
      { icon: File, label: '全部保存', shortcut: 'Ctrl+K S' },
      { type: 'divider' },
      { icon: File, label: '关闭文件', shortcut: 'Ctrl+W' },
      { icon: File, label: '关闭窗口', shortcut: 'Ctrl+Shift+W' },
    ],
    edit: [
      { icon: Undo, label: '撤销', shortcut: 'Ctrl+Z' },
      { icon: Redo, label: '重做', shortcut: 'Ctrl+Shift+Z' },
      { type: 'divider' },
      { icon: Scissors, label: '剪切', shortcut: 'Ctrl+X' },
      { icon: Copy, label: '复制', shortcut: 'Ctrl+C' },
      { icon: Clipboard, label: '粘贴', shortcut: 'Ctrl+V' },
      { type: 'divider' },
      { icon: Search, label: '查找', shortcut: 'Ctrl+F' },
      { icon: Search, label: '查找替换', shortcut: 'Ctrl+H' },
      { type: 'divider' },
      { icon: FileText, label: '选择全部', shortcut: 'Ctrl+A' },
      { icon: FileText, label: '行选择', shortcut: 'Ctrl+L' },
    ],
    view: [
      { icon: View, label: '切换活动栏', shortcut: 'Ctrl+B' },
      { icon: View, label: '切换侧边栏', shortcut: 'Ctrl+Shift+B' },
      { icon: Terminal, label: '切换面板', shortcut: 'Ctrl+`' },
      { type: 'divider' },
      { icon: ArrowRight, label: '放大', shortcut: 'Ctrl++' },
      { icon: ArrowRight, label: '缩小', shortcut: 'Ctrl+-' },
      { icon: Settings, label: '重置缩放', shortcut: 'Ctrl+0' },
      { type: 'divider' },
      { icon: Maximize2, label: '全屏', shortcut: 'F11' },
      { icon: Minimize2, label: '切换极简模式' },
    ],
    go: [
      { icon: Search, label: '快速打开', shortcut: 'Ctrl+P' },
      { icon: ArrowRightCircle, label: '转到行', shortcut: 'Ctrl+G' },
      { icon: ArrowRight, label: '转到定义', shortcut: 'F12' },
      { icon: Search, label: '查找引用', shortcut: 'Shift+F12' },
      { type: 'divider' },
      { icon: ArrowUp, label: '转到下一个', shortcut: 'F3' },
      { icon: ArrowDown, label: '转到上一个', shortcut: 'Shift+F3' },
    ],
    run: [
      { icon: Rocket, label: '运行', shortcut: 'F5' },
      { icon: Bug, label: '调试', shortcut: 'Ctrl+F5' },
      { icon: Square, label: '停止', shortcut: 'Shift+F5' },
      { type: 'divider' },
      { icon: Terminal, label: '新建终端', shortcut: 'Ctrl+`' },
      { icon: RefreshCw, label: '重启', shortcut: 'Ctrl+Shift+F5' },
    ],
    source: [
      { icon: GitBranch, label: '分支', shortcut: 'Ctrl+Shift+B' },
      { icon: GitCommit, label: '提交', shortcut: 'Ctrl+Enter' },
      { icon: ArrowUp, label: '推送', shortcut: 'Ctrl+Shift+P' },
      { icon: ArrowDown, label: '拉取', shortcut: 'Ctrl+Shift+P' },
      { type: 'divider' },
      { label: '同步', shortcut: 'Ctrl+Shift+S' },
      { label: '查看历史', shortcut: 'Ctrl+Shift+H' },
    ],
  };

  const menuLabels: Record<string, string> = {
    file: '文件',
    edit: '编辑',
    view: '查看',
    go: '前往',
    run: '运行',
    source: '源代码',
  };

  return (
    <div className="toolbar" ref={menuRef}>
      <div className="toolbar-left">
        <div className="toolbar-menu">
          {Object.entries(menuItems).map(([key, items], index) => (
            <div key={key} className="toolbar-menu-item">
              <button
                className={`toolbar-menu-button ${activeMenu === key ? 'toolbar-menu-button-active' : ''} ${hoveredMenuItem === key ? 'toolbar-menu-button-hover' : ''}`}
                onClick={() => setActiveMenu(activeMenu === key ? null : key)}
                onMouseEnter={() => setHoveredMenuItem(key)}
                onMouseLeave={() => setHoveredMenuItem(null)}
              >
                {menuLabels[key]}
                <span className="toolbar-menu-underline" />
              </button>
              {activeMenu === key && (
                <div className="toolbar-dropdown" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="toolbar-dropdown-header">
                    <span className="toolbar-dropdown-title">{menuLabels[key]}</span>
                    <div className="toolbar-dropdown-header-actions">
                      <button className="toolbar-dropdown-header-btn" title="最小化">
                        <Minimize2 size={12} />
                      </button>
                      <button className="toolbar-dropdown-header-btn" title="最大化">
                        <Maximize2 size={12} />
                      </button>
                      <button className="toolbar-dropdown-header-btn" onClick={() => setActiveMenu(null)} title="关闭">
                        <Square size={12} />
                      </button>
                    </div>
                  </div>
                  {items.map((item, idx) => (
                    item.type === 'divider' ? (
                      <div key={idx} className="toolbar-divider" />
                    ) : (
                      <button
                        key={idx}
                        className="toolbar-dropdown-item"
                        onMouseEnter={() => setHoveredMenuItem(key)}
                      >
                        {item.icon && <item.icon size={14} />}
                        <span className="toolbar-dropdown-item-label">{item.label}</span>
                        {item.shortcut && (
                          <div className="toolbar-shortcut-group">
                            {item.shortcut.split(' ').map((part, i) => (
                              <React.Fragment key={i}>
                                {i > 0 && <span className="toolbar-shortcut-separator" />}
                                <kbd className="toolbar-shortcut">{part}</kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="toolbar-center">
        <div className="toolbar-actions">
          <button className="toolbar-action-btn" title="打开文件">
            <FolderOpen size={16} />
          </button>
          <button className="toolbar-action-btn" title="保存">
            <Save size={16} />
          </button>
          <div className="toolbar-divider-vertical" />
          <button className="toolbar-action-btn" title="撤销">
            <Undo size={16} />
          </button>
          <button className="toolbar-action-btn" title="重做">
            <Redo size={16} />
          </button>
          <div className="toolbar-divider-vertical" />
          <button className="toolbar-action-btn toolbar-action-primary" title="运行">
            <Play size={16} />
            <span>运行</span>
          </button>
          <button className="toolbar-action-btn" title="调试">
            <Bug size={16} />
          </button>
          <div className="toolbar-divider-vertical" />
          <button className="toolbar-action-btn" title="终端">
            <Terminal size={16} />
          </button>
        </div>
      </div>

      <div className="toolbar-right">
        <button className="toolbar-action-btn" title="刷新">
          <RefreshCw size={16} />
        </button>
        <button className="toolbar-action-btn" title="更多操作">
          <MoreVertical size={16} />
        </button>
        <button className="toolbar-action-btn toolbar-action-settings" title="设置">
          <Settings size={16} />
        </button>
      </div>

      <style>{`
        .toolbar {
          height: var(--toolbar-height);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-2);
          flex-shrink: 0;
          user-select: none;
          position: relative;
          z-index: 50;
        }
        .toolbar-left {
          display: flex;
          align-items: center;
        }
        .toolbar-menu {
          display: flex;
          align-items: center;
        }
        .toolbar-menu-item {
          position: relative;
        }
        .toolbar-menu-button {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          padding: 4px 10px;
          cursor: pointer;
          border-radius: var(--radius-xs);
          transition: all var(--duration-fast);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .toolbar-menu-button:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .toolbar-menu-button-active {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .toolbar-menu-underline {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: var(--color-accent);
          transition: width var(--duration-normal) var(--ease-out);
        }
        .toolbar-menu-button-active .toolbar-menu-underline,
        .toolbar-menu-button:hover .toolbar-menu-underline {
          width: 60%;
        }
        .toolbar-dropdown {
          position: absolute;
          top: calc(100% + 2px);
          left: 0;
          min-width: 220px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-dropdown);
          z-index: 1000;
          overflow: hidden;
          animation: slideDown var(--duration-fast) var(--ease-out);
        }
        .toolbar-dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2) var(--space-3);
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
        }
        .toolbar-dropdown-title {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
        }
        .toolbar-dropdown-header-actions {
          display: flex;
          gap: 2px;
        }
        .toolbar-dropdown-header-btn {
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          padding: 2px 4px;
          border-radius: var(--radius-xs);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .toolbar-dropdown-header-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .toolbar-dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 7px 12px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: var(--font-size-sm);
          cursor: pointer;
          gap: var(--space-3);
          border-radius: var(--radius-xs);
          transition: all var(--duration-fast);
          text-align: left;
          position: relative;
        }
        .toolbar-dropdown-item:hover {
          background: var(--bg-hover);
        }
        .toolbar-dropdown-item:active {
          background: var(--bg-active);
        }
        .toolbar-dropdown-item-label {
          flex: 1;
          text-align: left;
        }
        .toolbar-shortcut-group {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .toolbar-shortcut-separator {
          color: var(--text-muted);
          font-size: 10px;
        }
        .toolbar-shortcut {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 20px;
          padding: 0 5px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xs);
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-secondary);
          box-shadow: 0 1px 0 var(--border-strong);
        }
        .toolbar-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: var(--space-1) 0;
        }
        .toolbar-center {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 0;
          background: var(--bg-tertiary);
          padding: 2px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }
        .toolbar-action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 4px 8px;
          cursor: pointer;
          border-radius: var(--radius-xs);
          transition: all var(--duration-fast);
        }
        .toolbar-action-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .toolbar-action-btn:active {
          transform: scale(0.96);
        }
        .toolbar-action-primary {
          background: var(--color-accent);
          color: var(--text-inverse);
          padding: 4px 12px;
          border-radius: var(--radius-sm);
          margin: 0 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        .toolbar-action-primary:hover {
          background: var(--color-accent-hover);
          color: var(--text-inverse);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .toolbar-action-settings {
          margin-left: 4px;
        }
        .toolbar-divider-vertical {
          width: 1px;
          height: 20px;
          background: var(--border-subtle);
          margin: 0 4px;
        }
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 2px;
        }
      `}</style>
    </div>
  );
}

export default Toolbar;