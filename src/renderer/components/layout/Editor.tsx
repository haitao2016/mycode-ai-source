import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import TabBar from './TabBar';
import { X, FileCode2, FileText, FileJson, File, ChevronRight, ChevronDown, Bookmark, GitCommit, Eye, EyeOff } from 'lucide-react';

interface EditorProps {
  bottomPanelHeight: number;
  rightPanelWidth: number;
}

const highlightCode = (code: string): React.ReactNode[] => {
  const lines = code.split('\n');
  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let tokenIndex = 0;

    const patterns = [
      { regex: /^(\s*)(\/\/.*)$/, color: 'var(--color-comment)', type: 'comment' },
      { regex: /^(\s*)(\/\*[\s\S]*?\*\/)$/, color: 'var(--color-comment)', type: 'comment' },
      { regex: /(['"`])(.*?)\1/g, color: 'var(--color-string)', type: 'string' },
      { regex: /\b(\d+\.?\d*)\b/g, color: 'var(--color-number)', type: 'number' },
      { regex: /\b(const|let|var|function|return|if|else|for|while|class|export|import|from|async|await|try|catch|throw|new|this|typeof|instanceof|extends|implements|interface|type|enum|private|public|protected|readonly|static|get|set|yield|async|await)\b/g, color: 'var(--color-keyword)', type: 'keyword' },
      { regex: /\b(String|Number|Boolean|Array|Object|Promise|Error|TypeError|undefined|null|true|false|Symbol|Map|Set|WeakMap|WeakSet|JSON|Math|Date|RegExp)\b/g, color: 'var(--color-type)', type: 'type' },
      { regex: /(\w+)\s*\(/g, color: 'var(--color-function)', type: 'function' },
      { regex: /(\.)(\w+)/g, color: 'var(--color-variable)', type: 'property' },
      { regex: /(@\w+)/g, color: 'var(--color-decorator)', type: 'decorator' },
    ];

    while (remaining.length > 0) {
      let matched = false;
      for (const { regex, color, type } of patterns) {
        const match = remaining.match(regex);
        if (match) {
          const matchIndex = remaining.indexOf(match[0]);
          if (matchIndex === 0) {
            if (type === 'function') {
              tokens.push(
                <span key={tokenIndex++} style={{ color }}>{match[1]}</span>,
                <span key={tokenIndex++}>(</span>
              );
            } else if (type === 'property') {
              tokens.push(
                <span key={tokenIndex++}>{match[1]}</span>,
                <span key={tokenIndex++} style={{ color }}>{match[2]}</span>
              );
            } else {
              tokens.push(
                <span key={tokenIndex++} style={{ color }}>{match[0]}</span>
              );
            }
            remaining = remaining.slice(match[0].length);
            matched = true;
            break;
          }
        }
      }
      if (!matched) {
        tokens.push(<span key={tokenIndex++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    }

    return (
      <div key={lineIndex} className="editor-line">
        {tokens}
      </div>
    );
  });
};

function Editor({ bottomPanelHeight }: EditorProps): React.ReactElement {
  const { tabs, activeTabId, setActiveTab, closeTab } = useStore();
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [isLineNumbersVisible, setIsLineNumbersVisible] = useState(true);
  const [isMinimapVisible, setIsMinimapVisible] = useState(true);
  const [foldingStates, setFoldingStates] = useState<Record<number, boolean>>({});
  const editorRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const lineElement = target.closest('.editor-line');
      if (lineElement) {
        const lines = editorRef.current?.querySelectorAll('.editor-line');
        if (lines) {
          const lineIndex = Array.from(lines).indexOf(lineElement);
          setCursorPos({ line: lineIndex + 1, col: 1 });
        }
      }
    };
    editorRef.current?.addEventListener('click', handleClick);
    return () => editorRef.current?.removeEventListener('click', handleClick);
  }, []);

  const toggleFolding = (lineIndex: number) => {
    setFoldingStates((prev) => ({
      ...prev,
      [lineIndex]: !prev[lineIndex],
    }));
  };

  if (!activeTab) {
    return (
      <div className="editor">
        <div className="editor-empty">
          <div className="editor-empty-logo">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="16" fill="var(--bg-tertiary)" />
              <path d="M20 32L28 24L36 32L28 40L20 32Z" fill="var(--color-accent)" opacity="0.3" />
              <path d="M32 32L40 24L48 32L40 40L32 32Z" fill="var(--color-accent)" opacity="0.6" />
              <path d="M28 20L36 28L28 36L20 28L28 20Z" fill="var(--color-accent)" />
            </svg>
          </div>
          <h2 className="editor-empty-title">MyCode AI</h2>
          <p className="editor-empty-desc">打开或创建文件开始编辑</p>
          <div className="editor-empty-shortcuts">
            <div className="editor-empty-shortcut">
              <kbd>Ctrl</kbd> + <kbd>P</kbd>
              <span>快速打开文件</span>
            </div>
            <div className="editor-empty-divider" />
            <div className="editor-empty-shortcut">
              <kbd>Ctrl</kbd> + <kbd>N</kbd>
              <span>新建文件</span>
            </div>
            <div className="editor-empty-divider" />
            <div className="editor-empty-shortcut">
              <kbd>Ctrl</kbd> + <kbd>O</kbd>
              <span>打开文件夹</span>
            </div>
          </div>
        </div>

        <style>{`
          .editor {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--bg-primary);
            overflow: hidden;
            min-width: 0;
          }
          .editor-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: var(--space-3);
            animation: fadeIn var(--duration-slow) var(--ease-out);
          }
          .editor-empty-logo {
            margin-bottom: var(--space-2);
            animation: scaleIn var(--duration-normal) var(--ease-bounce);
          }
          .editor-empty-title {
            font-size: 22px;
            font-weight: 600;
            color: var(--text-primary);
            letter-spacing: -0.5px;
          }
          .editor-empty-desc {
            font-size: var(--font-size-base);
            color: var(--text-tertiary);
          }
          .editor-empty-shortcuts {
            display: flex;
            align-items: center;
            gap: var(--space-4);
            margin-top: var(--space-3);
            font-size: var(--font-size-sm);
            color: var(--text-muted);
          }
          .editor-empty-shortcut {
            display: flex;
            align-items: center;
            gap: var(--space-2);
          }
          .editor-empty-divider {
            width: 1px;
            height: 16px;
            background: var(--border-default);
          }
          kbd {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 24px;
            height: 22px;
            padding: 0 6px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            font-family: var(--font-sans);
            font-size: 11px;
            color: var(--text-secondary);
            box-shadow: 0 1px 0 var(--border-strong);
          }
        `}</style>
      </div>
    );
  }

  const lineCount = (activeTab.content || '').split('\n').length;

  return (
    <div className="editor">
      <TabBar />
      <div className="editor-toolbar">
        <div className="editor-toolbar-left">
          <button className="editor-toolbar-btn" title="折叠全部">
            <ChevronRight size={14} />
          </button>
          <button className="editor-toolbar-btn" title="展开全部">
            <ChevronDown size={14} />
          </button>
          <div className="editor-toolbar-divider" />
          <button className="editor-toolbar-btn" onClick={() => setIsLineNumbersVisible(!isLineNumbersVisible)} title={isLineNumbersVisible ? '隐藏行号' : '显示行号'}>
            {isLineNumbersVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button className="editor-toolbar-btn" onClick={() => setIsMinimapVisible(!isMinimapVisible)} title={isMinimapVisible ? '隐藏缩略图' : '显示缩略图'}>
            <FileText size={14} />
          </button>
        </div>
        <div className="editor-toolbar-center">
          <span className="editor-toolbar-info">Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span className="editor-toolbar-divider" />
          <span className="editor-toolbar-info">{activeTab.language?.toUpperCase() || 'TEXT'}</span>
          <span className="editor-toolbar-divider" />
          <span className="editor-toolbar-info">UTF-8</span>
          <span className="editor-toolbar-divider" />
          <span className="editor-toolbar-info">空格: 2</span>
        </div>
        <div className="editor-toolbar-right">
          <button className="editor-toolbar-btn" title="添加书签">
            <Bookmark size={14} />
          </button>
          <button className="editor-toolbar-btn" title="Git 变更">
            <GitCommit size={14} />
          </button>
        </div>
      </div>
      <div className="editor-area" ref={editorRef}>
        <div className="editor-content">
          {isLineNumbersVisible && (
            <div className="editor-gutter">
              <div className="editor-gutter-fold">
                {(activeTab.content || '').split('\n').map((line, i) => {
                  const hasBlock = line.includes('{') && !line.includes('}');
                  return (
                    <button
                      key={i}
                      className={`editor-fold-btn ${foldingStates[i] ? 'editor-fold-btn-collapsed' : ''}`}
                      onClick={() => toggleFolding(i)}
                      title={hasBlock ? (foldingStates[i] ? '展开' : '折叠') : ''}
                    >
                      {hasBlock && (foldingStates[i] ? <ChevronRight size={10} /> : <ChevronDown size={10} />)}
                    </button>
                  );
                })}
              </div>
              <div className="editor-gutter-lines">
                {(activeTab.content || '').split('\n').map((_, i) => (
                  <div
                    key={i}
                    className={`editor-line-number ${selectedLines.includes(i) ? 'editor-line-number-selected' : ''}`}
                    onClick={() => setSelectedLines([i])}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="editor-code">
            <div className="editor-code-content">
              {highlightCode(activeTab.content || '')}
            </div>
          </div>
          {isMinimapVisible && (
            <div className="editor-minimap">
              <div className="editor-minimap-scrollbar">
                <div
                  className="editor-minimap-scrollbar-thumb"
                  style={{
                    height: `${Math.min((lineCount * 22) / 1000, 100)}%`,
                  }}
                />
              </div>
              <div className="editor-minimap-content">
                {(activeTab.content || '').split('\n').map((line, i) => (
                  <div
                    key={i}
                    className={`minimap-line ${selectedLines.includes(i) ? 'minimap-line-selected' : ''}`}
                    style={{ opacity: line.trim() ? 0.6 : 0.1 }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          overflow: hidden;
          min-width: 0;
        }
        .editor-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 28px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          padding: 0 var(--space-3);
          flex-shrink: 0;
        }
        .editor-toolbar-left,
        .editor-toolbar-right {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .editor-toolbar-center {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .editor-toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius-xs);
          transition: all var(--duration-fast);
        }
        .editor-toolbar-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .editor-toolbar-divider {
          width: 1px;
          height: 16px;
          background: var(--border-subtle);
          margin: 0 var(--space-2);
        }
        .editor-toolbar-info {
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
        }
        .editor-area {
          flex: 1;
          overflow: auto;
          display: flex;
        }
        .editor-content {
          display: flex;
          min-height: 100%;
          width: 100%;
        }
        .editor-gutter {
          display: flex;
          flex-direction: row;
          padding: var(--space-3) 0;
          min-width: 56px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          position: sticky;
          left: 0;
          z-index: 1;
          user-select: none;
          flex-shrink: 0;
        }
        .editor-gutter-lines {
          display: flex;
          flex-direction: column;
          width: 48px;
        }
        .editor-gutter-fold {
          display: flex;
          flex-direction: column;
          width: 8px;
        }
        .editor-line-number {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: var(--space-3);
          height: 22px;
          font-family: var(--font-mono);
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .editor-line-number:hover {
          color: var(--text-secondary);
          background: var(--bg-hover);
        }
        .editor-line-number-selected {
          color: var(--text-primary);
          background: var(--bg-focus);
        }
        .editor-fold-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          height: 22px;
          width: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          color: var(--text-tertiary);
          transition: all var(--duration-fast);
        }
        .editor-fold-btn:hover {
          color: var(--text-primary);
        }
        .editor-code {
          flex: 1;
          padding: var(--space-3) var(--space-4);
          font-family: var(--font-mono);
          font-size: var(--font-size-md);
          line-height: 22px;
          color: var(--text-primary);
          white-space: pre;
          margin: 0;
          tab-size: 2;
          overflow-x: auto;
        }
        .editor-code-content {
          min-width: 100%;
        }
        .editor-line {
          min-height: 22px;
          position: relative;
        }
        .editor-line:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .editor-minimap {
          width: 50px;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-subtle);
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
        }
        .editor-minimap-scrollbar {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--bg-tertiary);
        }
        .editor-minimap-scrollbar-thumb {
          background: var(--border-default);
          border-radius: 2px;
          margin: 2px;
        }
        .editor-minimap-content {
          padding: var(--space-2) 0;
        }
        .minimap-line {
          height: 3px;
          margin-bottom: 1px;
          background: var(--border-default);
        }
        .minimap-line-selected {
          background: var(--color-accent);
          opacity: 0.8 !important;
        }
      `}</style>
    </div>
  );
}

export default Editor;