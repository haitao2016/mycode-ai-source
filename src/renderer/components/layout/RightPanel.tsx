import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { getPanelComponent } from '../panels';
import { X, Search, ChevronDown, GripVertical, Pin } from 'lucide-react';

interface RightPanelProps {
  width: number;
}

function RightPanel({ width }: RightPanelProps): React.ReactElement {
  const { activeRightPanel, setActiveRightPanel, toggleRightPanel, panels } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousPanel, setPreviousPanel] = useState(activeRightPanel);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rightPanels = panels.filter((p) => p.category === 'right');
  const filteredPanels = rightPanels.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ActivePanelComponent = getPanelComponent(activeRightPanel);
  const currentPanelName = rightPanels.find((p) => p.id === activeRightPanel)?.name || '面板';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeRightPanel !== previousPanel) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPreviousPanel(activeRightPanel);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeRightPanel, previousPanel]);

  const handlePanelChange = (panelId: string) => {
    if (panelId !== activeRightPanel) {
      setActiveRightPanel(panelId);
    }
    setShowDropdown(false);
  };

  return (
    <div className="rightpanel" style={{ width }}>
      <div className="rightpanel-header">
        <div className="rightpanel-header-left">
          <div className="rightpanel-grip">
            <GripVertical size={12} />
          </div>
          <div className="rightpanel-dropdown" ref={dropdownRef}>
            <button
              className={`rightpanel-dropdown-btn ${showDropdown ? 'rightpanel-dropdown-btn-active' : ''}`}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="rightpanel-dropdown-label">{currentPanelName}</span>
              <ChevronDown size={12} className={`rightpanel-dropdown-arrow ${showDropdown ? 'rightpanel-dropdown-arrow-rotated' : ''}`} />
            </button>
            {showDropdown && (
              <div className="rightpanel-dropdown-menu animate-slide-down">
                <div className="rightpanel-dropdown-search">
                  <Search size={12} />
                  <input
                    type="text"
                    placeholder="搜索面板..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rightpanel-dropdown-input"
                    autoFocus
                  />
                </div>
                {filteredPanels.length > 0 ? (
                  filteredPanels.map((panel, index) => (
                    <button
                      key={panel.id}
                      className={`rightpanel-dropdown-item ${activeRightPanel === panel.id ? 'rightpanel-dropdown-item-active' : ''}`}
                      onClick={() => handlePanelChange(panel.id)}
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      {panel.name}
                    </button>
                  ))
                ) : (
                  <div className="rightpanel-dropdown-empty">
                    未找到匹配的面板
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="rightpanel-actions">
          <button className="rightpanel-action-btn" title="固定面板">
            <Pin size={12} />
          </button>
          <button className="rightpanel-action-btn" title="搜索">
            <Search size={12} />
          </button>
          <button className="rightpanel-action-btn rightpanel-action-btn-close" onClick={toggleRightPanel} title="关闭">
            <X size={12} />
          </button>
        </div>
      </div>
      <div className={`rightpanel-content ${isAnimating ? 'rightpanel-content-animating' : ''}`}>
        {ActivePanelComponent ? <ActivePanelComponent /> : (
          <div className="rightpanel-empty">
            <p>面板未找到</p>
          </div>
        )}
      </div>

      <style>{`
        .rightpanel {
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width var(--duration-normal) var(--ease-out);
          position: relative;
        }
        .rightpanel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 36px;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-subtle);
          padding: 0 4px;
          flex-shrink: 0;
        }
        .rightpanel-header-left {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rightpanel-grip {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 100%;
          cursor: col-resize;
          color: var(--text-tertiary);
          opacity: 0;
          transition: opacity var(--duration-fast);
        }
        .rightpanel:hover .rightpanel-grip {
          opacity: 1;
        }
        .rightpanel-grip:hover {
          background: var(--bg-hover);
        }
        .rightpanel-dropdown {
          position: relative;
        }
        .rightpanel-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: var(--font-size-sm);
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: var(--radius-xs);
          transition: all var(--duration-fast);
          white-space: nowrap;
        }
        .rightpanel-dropdown-btn:hover {
          background: var(--bg-hover);
        }
        .rightpanel-dropdown-btn-active {
          background: var(--bg-hover);
        }
        .rightpanel-dropdown-label {
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rightpanel-dropdown-arrow {
          flex-shrink: 0;
          transition: transform var(--duration-fast) var(--ease-out);
        }
        .rightpanel-dropdown-arrow-rotated {
          transform: rotate(180deg);
        }
        .rightpanel-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 260px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-dropdown);
          z-index: 1000;
          margin-top: 4px;
          max-height: 320px;
          overflow-y: auto;
        }
        .rightpanel-dropdown-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: var(--space-2);
          border-bottom: 1px solid var(--border-subtle);
        }
        .rightpanel-dropdown-input {
          flex: 1;
          background: var(--bg-secondary);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-xs);
          padding: 4px 8px;
          font-size: var(--font-size-xs);
          color: var(--text-primary);
          outline: none;
          transition: border-color var(--duration-fast);
        }
        .rightpanel-dropdown-input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 1px var(--color-accent);
        }
        .rightpanel-dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 6px 12px;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: var(--font-size-sm);
          cursor: pointer;
          border-radius: var(--radius-xs);
          transition: all var(--duration-fast);
          text-align: left;
          opacity: 0;
          animation: slideInAndFade var(--duration-fast) var(--ease-out) forwards;
        }
        .rightpanel-dropdown-item:hover {
          background: var(--bg-hover);
          padding-left: 14px;
        }
        .rightpanel-dropdown-item-active {
          background: var(--bg-active);
          color: var(--text-accent);
          font-weight: 500;
        }
        .rightpanel-dropdown-empty {
          padding: 16px;
          text-align: center;
          color: var(--text-tertiary);
          font-size: var(--font-size-sm);
        }
        .rightpanel-actions {
          display: flex;
          gap: 2px;
        }
        .rightpanel-action-btn {
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-xs);
          transition: all var(--duration-fast);
        }
        .rightpanel-action-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .rightpanel-action-btn-close:hover {
          background: var(--color-error-bg);
          color: var(--color-error);
        }
        .rightpanel-content {
          flex: 1;
          overflow: auto;
          transition: opacity var(--duration-fast) var(--ease-out);
        }
        .rightpanel-content-animating {
          opacity: 0.5;
        }
        .rightpanel-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-tertiary);
          font-size: var(--font-size-sm);
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInAndFade {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-down {
          animation: slideDown var(--duration-fast) var(--ease-out);
        }
      `}</style>
    </div>
  );
}

export default RightPanel;