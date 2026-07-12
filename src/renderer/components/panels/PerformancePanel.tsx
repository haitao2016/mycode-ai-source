import React from 'react';
import BasePanel from './BasePanel';

function PerformancePanel(): React.ReactElement {
  return (
    <BasePanel title="性能" icon="⚡">
      <div style={styles.performance}>
        <div style={styles.metric}>CPU: 12%</div>
        <div style={styles.metric}>内存: 256 MB</div>
        <div style={styles.metric}>FPS: 60</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  performance: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metric: {
    padding: '6px',
    background: 'var(--color-sideBar-hover)',
    borderRadius: '4px',
    fontSize: '12px',
  },
};

export default PerformancePanel;