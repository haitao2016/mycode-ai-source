import React from 'react';

function TerminalPanel(): React.ReactElement {
  return (
    <div style={styles.terminal}>
      <div style={styles.prompt}>
        <span style={styles.user}>user@mycode-ai</span>
        <span style={styles.colon}>:</span>
        <span style={styles.path}>~</span>
        <span style={styles.dollar}>$</span>
        <span style={styles.cursor}>_</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  terminal: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: '12px',
    lineHeight: '1.4',
    color: 'var(--color-panel-text)',
  },
  prompt: {
    display: 'flex',
    alignItems: 'center',
  },
  user: {
    color: '#4ec9b0',
  },
  colon: {
    color: '#569cd6',
    marginRight: '4px',
  },
  path: {
    color: '#9cdcfe',
  },
  dollar: {
    color: 'var(--color-panel-text)',
    marginLeft: '8px',
  },
  cursor: {
    animation: 'blink 1s infinite',
  },
};

export default TerminalPanel;