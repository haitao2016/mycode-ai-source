import React from 'react';
import { useStore } from '../../store/useStore';
import { getPanelComponent } from '../panels';

interface SidebarProps {
  width: number;
}

function Sidebar({ width }: SidebarProps): React.ReactElement {
  const { activeSidebarPanel, panels } = useStore();

  const SidebarPanel = getPanelComponent(activeSidebarPanel);

  return (
    <div className="sidebar" style={{ width }}>
      {SidebarPanel ? <SidebarPanel /> : (
        <div className="sidebar-empty">
          <p>面板未找到</p>
        </div>
      )}

      <style>{`
        .sidebar {
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
          transition: width var(--duration-normal) var(--ease-out);
        }
        .sidebar-empty {
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

export default Sidebar;