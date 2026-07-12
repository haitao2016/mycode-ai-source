import React from 'react';
import BasePanel from './BasePanel';

function ProjectPanel(): React.ReactElement {
  return (
    <BasePanel title="项目" icon="📂">
      <div style={styles.project}>
        <div style={styles.placeholder}>项目管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  project: {
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

export default ProjectPanel;