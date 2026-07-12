import React from 'react';
import BasePanel from './BasePanel';

function WorkspacePanel(): React.ReactElement {
  return (
    <BasePanel title="工作区" icon="🏢">
      <div style={styles.workspace}>
        <div style={styles.placeholder}>工作区管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  workspace: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: 'var(--color-sideBar-text-muted)',
    fontSize: '14px',
  },
};

export default WorkspacePanel;