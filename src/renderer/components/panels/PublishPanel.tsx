import React from 'react';
import BasePanel from './BasePanel';

function PublishPanel(): React.ReactElement {
  return (
    <BasePanel title="发布" icon="🚀">
      <div style={styles.publish}>
        <div style={styles.placeholder}>发布管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  publish: {
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

export default PublishPanel;