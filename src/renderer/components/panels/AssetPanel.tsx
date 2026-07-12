import React from 'react';
import BasePanel from './BasePanel';

function AssetPanel(): React.ReactElement {
  return (
    <BasePanel title="资源" icon="📦">
      <div style={styles.asset}>
        <div style={styles.placeholder}>资源管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  asset: {
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

export default AssetPanel;