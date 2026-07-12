import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getPanelComponent } from '../panels';
import { X, Maximize2, Minimize2, GripVertical } from 'lucide-react';

interface BottomPanelProps {
  height: number;
}

function BottomPanel({ height }: BottomPanelProps): React.ReactElement {
  const { activeBottomPanel, setActiveBottomPanel, toggleBottomPanel, panels } = useStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousPanel, setPreviousPanel] = useState(activeBottomPanel);

  const bottomPanels = panels.filter((p) => p.category === 'bottom');
  const ActivePanelComponent = getPanelComponent(activeBottomPanel);

  useEffect(() => {
    if (activeBottomPanel !== previousPanel) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPreviousPanel(activeBottomPanel);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [activeBottomPanel, previousPanel]);

  const handlePanelChange = (panelId: string) => {
    if (panelId !== activeBottomPanel) {
      setActiveBottomPanel(panelId);
    }
  };

  return (
    <div className="bottompanel" style={{ height }}>
      <div className="bottompanel-header">
        <div className="bottompanel-tabs">
          {bottomPanels.map((panel) => (
            <button
              key={panel.id}
              className={`bottompanel-tab ${activeBottomPanel === panel.id ? 'bottompanel-tab-active' : ''}`}
              onClick={() => handlePanelChange(panel.id)}
              title={panel.name}
            >
              {panel.name}
            </button>
          ))}
        </div>
        <div className="bottompanel-header-right">
          <div className="bottompanel-grip">
            <GripVertical size={12} />
          </div>
          <div className="bottompanel-actions">
            <button className="bottompanel-action-btn" title="最小化">
              <Minimize2 size={12} />
            </button>
            <button className="bottompanel-action-btn" title="最大化">
              <Maximize2 size={12} />
            </button>
            <button className="bottompanel-action-btn bottompanel-action-btn-close" onClick={toggleBottomPanel} title="关闭">
              <X size={12} />
            </button>
          </div>
        </div>
      </div>
      <div className={`bottompanel-content ${isAnimating ? 'bottompanel-content-animating' : ''}`}>
        {ActivePanelComponent ? <ActivePanelComponent /> : (
          <div className="bottompanel-empty">
            <p>面板未找到</p>
          </div>
        )}
      </div>

      <style>{`
        .bottompanel {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: height var(--duration-normal) var(--ease-out);
        }
        .bottompanel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 28px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-subtle);
          padding-left: 4px;
          flex-shrink: 0;
        }
        .bottompanel-tabs {
          display: flex;
          align-items: center;
          height: 100%;
          overflow-x: auto;
          overflow-y: hidden;
        }
        .bottompanel-tabs::-webkit-scrollbar {
          height: 0;
        }
        .bottompanel-tab {
          padding: 0 12px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: var(--font-size-xs);
          cursor: pointer;
          height: 100%;
          border-radius: var(--radius-xs) var(--radius-xs) 0 0;
          transition: all var(--duration-fast);
          white-space: nowrap;
          position: relative;
        }
        .bottompanel-tab:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .bottompanel-tab-active {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .bottompanel-tab-active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 6px;
          right: 6px;
          height: 2px;
          background: var(--color-accent);
          border-radius: 1px 1px 0 0;
        }
        .bottompanel-header-right {
          display: flex;
          align-items: center;
          gap: 2px;
          padding-right: 4px;
        }
        .bottompanel-grip {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 100%;
          cursor: row-resize;
          color: var(--text-tertiary);
          opacity: 0;
          transition: opacity var(--duration-fast);
          margin-right: 2px;
        }
        .bottompanel:hover .bottompanel-grip {
          opacity: 1;
        }
        .bottompanel-grip:hover {
          background: var(--bg-hover);
        }
        .bottompanel-actions {
          display: flex;
          gap: 2px;
        }
        .bottompanel-action-btn {
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 2px 6px;
          border-radius: var(--radius-xs);
          transition: all var(--duration-fast);
        }
        .bottompanel-action-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .bottompanel-action-btn-close:hover {
          background: var(--color-error-bg);
          color: var(--color-error);
        }
        .bottompanel-content {
          flex: 1;
          overflow: auto;
          padding: var(--space-2);
          transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
        }
        .bottompanel-content-animating {
          opacity: 0.5;
          transform: translateY(2px);
        }
        .bottompanel-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-tertiary);
          font-size: var(--font-size-sm);
        }
      `}</style>
    </div>
  );
}

export default BottomPanel;