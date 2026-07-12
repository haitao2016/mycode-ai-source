import React from 'react';
import BasePanel from './BasePanel';

function CollaborationPanel(): React.ReactElement {
  return (
    <BasePanel title="协作" icon="👥">
      <div style={styles.collab}>
        <div style={styles.placeholder}>协作管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  collab: {
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

export default CollaborationPanel;