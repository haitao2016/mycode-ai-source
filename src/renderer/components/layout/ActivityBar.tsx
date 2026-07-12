import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ActivityBarItem } from '../../types';
import {
  FolderOpen, Search, GitBranch, Bug, Puzzle, MessageSquare,
  Sparkles, Settings, Bell, Cloud, Users, Eye, Terminal, GitCommit, FileText, Code2
} from 'lucide-react';

const activityBarItems: ActivityBarItem[] = [
  { id: 'explorer', icon: 'folder', label: '资源管理器' },
  { id: 'search', icon: 'search', label: '搜索' },
  { id: 'git', icon: 'git', label: '源代码管理' },
  { id: 'debug', icon: 'bug', label: '运行和调试' },
  { id: 'extensions', icon: 'extension', label: '扩展' },
];

const iconMap: Record<string, React.ReactNode> = {
  folder: <FolderOpen size={22} strokeWidth={1.5} />,
  search: <Search size={22} strokeWidth={1.5} />,
  git: <GitBranch size={22} strokeWidth={1.5} />,
  extension: <Puzzle size={22} strokeWidth={1.5} />,
  message: <MessageSquare size={22} strokeWidth={1.5} />,
  bug: <Bug size={22} strokeWidth={1.5} />,
};

function ActivityBar(): React.ReactElement {
  const { activeSidebarPanel, setActiveSidebarPanel } = useStore();
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);

  return (
    <div className="activitybar">
      <div className="activitybar-main">
        {activityBarItems.map((item, index) => (
          <button
            key={item.id}
            className={`activitybar-btn ${activeSidebarPanel === item.id ? 'activitybar-btn-active' : ''} ${pressedBtn === item.id ? 'activitybar-btn-pressed' : ''}`}
            onClick={() => setActiveSidebarPanel(item.id)}
            onMouseEnter={() => setHoveredBtn(item.id)}
            onMouseLeave={() => {
              setHoveredBtn(null);
              setPressedBtn(null);
            }}
            onMouseDown={() => setPressedBtn(item.id)}
            onMouseUp={() => setPressedBtn(null)}
            title={item.label}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <span className="activitybar-btn-icon">
              {iconMap[item.icon]}
            </span>
            <div className="activitybar-indicator" />
            {(hoveredBtn === item.id || activeSidebarPanel === item.id) && (
              <div className="activitybar-tooltip" role="tooltip" data-direction="right">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="activitybar-divider" />

      <div className="activitybar-ai">
        <button
          className={`activitybar-btn activitybar-btn-ai ${pressedBtn === 'ai' ? 'activitybar-btn-pressed' : ''}`}
          onClick={() => setActiveSidebarPanel('ai-chat')}
          onMouseEnter={() => setHoveredBtn('ai')}
          onMouseLeave={() => {
            setHoveredBtn(null);
            setPressedBtn(null);
          }}
          onMouseDown={() => setPressedBtn('ai')}
          onMouseUp={() => setPressedBtn(null)}
          title="AI 聊天"
        >
          <span className="activitybar-btn-icon activitybar-btn-icon-ai">
            <Sparkles size={22} strokeWidth={1.5} />
          </span>
          <div className="activitybar-indicator activitybar-indicator-ai" />
          <div className="activitybar-ai-pulse" />
          {hoveredBtn === 'ai' && (
            <div className="activitybar-tooltip" role="tooltip" data-direction="right">AI 聊天</div>
          )}
        </button>
        <button
          className={`activitybar-btn ${pressedBtn === 'notifications' ? 'activitybar-btn-pressed' : ''}`}
          onMouseEnter={() => setHoveredBtn('notifications')}
          onMouseLeave={() => {
            setHoveredBtn(null);
            setPressedBtn(null);
          }}
          onMouseDown={() => setPressedBtn('notifications')}
          onMouseUp={() => setPressedBtn(null)}
          title="通知"
        >
          <span className="activitybar-btn-icon">
            <Bell size={22} strokeWidth={1.5} />
          </span>
          <span className="activitybar-badge activitybar-badge-dot" />
          {hoveredBtn === 'notifications' && (
            <div className="activitybar-tooltip" role="tooltip" data-direction="right">通知</div>
          )}
        </button>
        <button
          className={`activitybar-btn ${pressedBtn === 'cloud' ? 'activitybar-btn-pressed' : ''}`}
          onMouseEnter={() => setHoveredBtn('cloud')}
          onMouseLeave={() => {
            setHoveredBtn(null);
            setPressedBtn(null);
          }}
          onMouseDown={() => setPressedBtn('cloud')}
          onMouseUp={() => setPressedBtn(null)}
          title="云端同步"
        >
          <span className="activitybar-btn-icon">
            <Cloud size={22} strokeWidth={1.5} />
          </span>
          <span className="activitybar-badge activitybar-badge-dot activitybar-badge-success" />
          {hoveredBtn === 'cloud' && (
            <div className="activitybar-tooltip" role="tooltip" data-direction="right">云端同步</div>
          )}
        </button>
        <button
          className={`activitybar-btn ${pressedBtn === 'collaboration' ? 'activitybar-btn-pressed' : ''}`}
          onMouseEnter={() => setHoveredBtn('collaboration')}
          onMouseLeave={() => {
            setHoveredBtn(null);
            setPressedBtn(null);
          }}
          onMouseDown={() => setPressedBtn('collaboration')}
          onMouseUp={() => setPressedBtn(null)}
          title="协作"
        >
          <span className="activitybar-btn-icon">
            <Users size={22} strokeWidth={1.5} />
          </span>
          {hoveredBtn === 'collaboration' && (
            <div className="activitybar-tooltip" role="tooltip" data-direction="right">协作</div>
          )}
        </button>
      </div>

      <div className="activitybar-divider" />

      <div className="activitybar-bottom">
        <button
          className={`activitybar-btn ${pressedBtn === 'preview' ? 'activitybar-btn-pressed' : ''}`}
          onMouseEnter={() => setHoveredBtn('preview')}
          onMouseLeave={() => {
            setHoveredBtn(null);
            setPressedBtn(null);
          }}
          onMouseDown={() => setPressedBtn('preview')}
          onMouseUp={() => setPressedBtn(null)}
          title="预览"
        >
          <span className="activitybar-btn-icon">
            <Eye size={22} strokeWidth={1.5} />
          </span>
          {hoveredBtn === 'preview' && (
            <div className="activitybar-tooltip" role="tooltip" data-direction="right">预览</div>
          )}
        </button>
        <button
          className={`activitybar-btn ${pressedBtn === 'settings' ? 'activitybar-btn-pressed' : ''}`}
          onMouseEnter={() => setHoveredBtn('settings')}
          onMouseLeave={() => {
            setHoveredBtn(null);
            setPressedBtn(null);
          }}
          onMouseDown={() => setPressedBtn('settings')}
          onMouseUp={() => setPressedBtn(null)}
          title="设置"
        >
          <span className="activitybar-btn-icon">
            <Settings size={22} strokeWidth={1.5} />
          </span>
          {hoveredBtn === 'settings' && (
            <div className="activitybar-tooltip" role="tooltip" data-direction="right">设置</div>
          )}
        </button>
      </div>

      <style>{`
        .activitybar {
          width: var(--activitybar-width);
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-2) 0;
          flex-shrink: 0;
          position: relative;
          z-index: 100;
        }
        .activitybar-main {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .activitybar-btn {
          position: relative;
          width: var(--activitybar-width);
          height: var(--activitybar-width);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          transition: all var(--duration-fast);
          overflow: visible;
          animation: fadeIn var(--duration-slow) var(--ease-out) backwards;
        }
        .activitybar-btn:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }
        .activitybar-btn-active {
          color: var(--text-primary);
        }
        .activitybar-btn-active .activitybar-btn-icon {
          transform: scale(1.05);
        }
        .activitybar-btn-pressed {
          transform: scale(0.95);
        }
        .activitybar-btn-active .activitybar-indicator {
          opacity: 1;
          transform: translateY(-50%) scaleY(1);
        }
        .activitybar-btn-ai {
          color: var(--color-accent);
          position: relative;
        }
        .activitybar-btn-ai:hover {
          color: var(--color-accent-hover);
          background: var(--color-accent-bg);
        }
        .activitybar-btn-ai::after {
          content: '';
          position: absolute;
          bottom: 8px;
          width: 8px;
          height: 8px;
          background: var(--color-accent);
          border-radius: 50%;
          animation: pulse 2s var(--ease-in-out) infinite;
        }
        .activitybar-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--duration-fast) var(--ease-out);
        }
        .activitybar-btn-icon-ai {
          filter: drop-shadow(0 0 4px rgba(0, 122, 204, 0.3));
        }
        .activitybar-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%) scaleY(0.8);
          width: 2px;
          height: 20px;
          background: var(--color-accent);
          opacity: 0;
          transition: all var(--duration-fast) var(--ease-out);
          border-radius: 0 2px 2px 0;
        }
        .activitybar-indicator-ai {
          background: var(--color-accent);
        }
        .activitybar-ai-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-accent);
          opacity: 0;
          animation: pulse-glow 2s var(--ease-in-out) infinite;
          pointer-events: none;
        }
        .activitybar-badge {
          position: absolute;
          top: 8px;
          right: 10px;
          font-size: 10px;
          font-weight: 600;
          padding: 1px 4px;
          border-radius: 10px;
          background: var(--color-error);
          color: var(--text-inverse);
          min-width: 16px;
          text-align: center;
          animation: scaleInSmall var(--duration-fast) var(--ease-out);
        }
        .activitybar-badge-dot {
          width: 8px;
          height: 8px;
          padding: 0;
          min-width: auto;
          border-radius: 50%;
        }
        .activitybar-badge-success {
          background: var(--color-success);
        }
        .activitybar-divider {
          width: 24px;
          height: 1px;
          background: var(--border-subtle);
          margin: var(--space-3) 0;
          opacity: 0.6;
          animation: fadeIn var(--duration-slow) var(--ease-out);
        }
        .activitybar-ai {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .activitybar-bottom {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .activitybar-tooltip {
          position: absolute;
          left: calc(100% + var(--space-2));
          top: 50%;
          transform: translateY(-50%);
          background: var(--tooltip-bg);
          color: var(--tooltip-text);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          border: 1px solid var(--tooltip-border);
          font-size: var(--font-size-xs);
          white-space: nowrap;
          z-index: 1000;
          box-shadow: var(--tooltip-shadow);
          animation: slideInFromLeft var(--duration-fast) var(--ease-out);
          pointer-events: none;
        }
        .activitybar-tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: var(--tooltip-border);
        }
        .activitybar-tooltip::after {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 4px solid transparent;
          border-right-color: var(--tooltip-bg);
          margin-right: -1px;
        }
        .activitybar-tooltip[data-direction="left"] {
          left: auto;
          right: calc(100% + var(--space-2));
        }
        .activitybar-tooltip[data-direction="left"]::before {
          right: auto;
          left: 100%;
          border-right-color: transparent;
          border-left-color: var(--tooltip-border);
        }
        .activitybar-tooltip[data-direction="left"]::after {
          right: auto;
          left: 100%;
          border-right-color: transparent;
          border-left-color: var(--tooltip-bg);
          margin-right: 0;
          margin-left: -1px;
        }
      `}</style>
    </div>
  );
}

export default ActivityBar;