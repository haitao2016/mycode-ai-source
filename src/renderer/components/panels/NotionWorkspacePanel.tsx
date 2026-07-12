import React from 'react';
import BasePanel from './BasePanel';

function NotionWorkspacePanel(): React.ReactElement {
  return (
    <BasePanel title="Notion" icon="📒">
      <div style={styles.notion}>
        <div style={styles.placeholder}>Notion 工作区</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  notion: {
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

export default NotionWorkspacePanel;