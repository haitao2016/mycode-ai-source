import React from 'react';
import BasePanel from './BasePanel';

function LocalModelPanel(): React.ReactElement {
  return (
    <BasePanel title="本地模型" icon="💻">
      <div style={styles.model}>
        <div style={styles.placeholder}>本地模型管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  model: {
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

export default LocalModelPanel;