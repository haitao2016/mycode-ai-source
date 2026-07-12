import React from 'react';

function GitOutputPanel(): React.ReactElement {
  return (
    <div style={styles.container}>
      <div style={styles.header}>Git 操作输出</div>
      <div style={styles.content}>
        <div style={styles.log}>等待 Git 操作...</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-panel-text-secondary)',
    borderBottom: '1px solid var(--color-panel-border)',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '8px',
  },
  log: {
    fontSize: '12px',
    color: 'var(--color-panel-text-secondary)',
    fontFamily: 'monospace',
  },
};

export default GitOutputPanel;