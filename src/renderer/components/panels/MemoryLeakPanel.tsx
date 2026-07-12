import React from 'react';
import BasePanel from './BasePanel';

function MemoryLeakPanel(): React.ReactElement {
  return (
    <BasePanel title="内存泄漏" icon="💧">
      <div style={styles.leak}>
        <div style={styles.placeholder}>内存泄漏检测</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  leak: {
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

export default MemoryLeakPanel;