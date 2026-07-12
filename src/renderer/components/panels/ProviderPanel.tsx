import React from 'react';
import BasePanel from './BasePanel';

function ProviderPanel(): React.ReactElement {
  return (
    <BasePanel title="提供商" icon="☁️">
      <div style={styles.provider}>
        <div style={styles.placeholder}>AI 提供商管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  provider: {
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

export default ProviderPanel;