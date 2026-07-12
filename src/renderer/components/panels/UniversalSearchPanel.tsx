import React from 'react';
import BasePanel from './BasePanel';

function UniversalSearchPanel(): React.ReactElement {
  return (
    <BasePanel title="通用搜索" icon="🔎">
      <div style={styles.universal}>
        <div style={styles.placeholder}>通用搜索</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  universal: {
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

export default UniversalSearchPanel;