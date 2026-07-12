import React from 'react';
import BasePanel from './BasePanel';

function BuildPanel(): React.ReactElement {
  return (
    <BasePanel title="构建" icon="🔨">
      <div style={styles.build}>
        <div style={styles.status}>构建状态: 就绪</div>
        <button style={styles.btn}>开始构建</button>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  build: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  status: {
    padding: '8px',
    background: 'var(--color-sideBar-hover)',
    borderRadius: '4px',
    fontSize: '12px',
  },
  btn: {
    padding: '8px',
    background: 'var(--color-primary)',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default BuildPanel;