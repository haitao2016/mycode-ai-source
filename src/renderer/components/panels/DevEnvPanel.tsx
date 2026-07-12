import React from 'react';
import BasePanel from './BasePanel';

function DevEnvPanel(): React.ReactElement {
  return (
    <BasePanel title="开发环境" icon="🛠️">
      <div style={styles.env}>
        <div style={styles.placeholder}>开发环境管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  env: {
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

export default DevEnvPanel;