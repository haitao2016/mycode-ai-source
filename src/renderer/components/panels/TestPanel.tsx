import React from 'react';
import BasePanel from './BasePanel';

function TestPanel(): React.ReactElement {
  return (
    <BasePanel title="测试" icon="✅">
      <div style={styles.tests}>
        <div style={styles.test}>
          <span style={styles.icon}>✓</span>
          <span style={styles.name}>testMainFunction</span>
        </div>
        <div style={styles.test}>
          <span style={styles.icon}>✓</span>
          <span style={styles.name}>testAppRender</span>
        </div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tests: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  test: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px',
    background: 'var(--color-sideBar-hover)',
    borderRadius: '4px',
    gap: '8px',
  },
  icon: {
    color: 'var(--color-success)',
  },
  name: {
    fontSize: '12px',
  },
};

export default TestPanel;