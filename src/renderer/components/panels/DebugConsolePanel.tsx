import React from 'react';

function DebugConsolePanel(): React.ReactElement {
  return (
    <div style={styles.console}>
      <div style={styles.line}>
        <span style={styles.logType}>LOG</span>
        <span style={styles.message}>应用已启动</span>
      </div>
      <div style={styles.line}>
        <span style={styles.logType}>INFO</span>
        <span style={styles.message}>扩展加载完成</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  console: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: '12px',
    lineHeight: '1.4',
    color: 'var(--color-panel-text)',
  },
  line: {
    padding: '2px 0',
    display: 'flex',
    gap: '8px',
  },
  logType: {
    width: '40px',
    color: 'var(--color-primary)',
    fontWeight: 'bold',
  },
  message: {
    color: 'var(--color-panel-text)',
  },
};

export default DebugConsolePanel;