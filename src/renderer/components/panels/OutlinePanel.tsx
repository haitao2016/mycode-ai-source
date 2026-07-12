import React from 'react';
import BasePanel from './BasePanel';

function OutlinePanel(): React.ReactElement {
  return (
    <BasePanel title="大纲" icon="📋">
      <div style={styles.outline}>
        <div style={styles.item}>class App</div>
        <div style={styles.child}>constructor()</div>
        <div style={styles.child}>render()</div>
        <div style={styles.item}>function main()</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  outline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  item: {
    padding: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  child: {
    padding: '4px 6px 4px 20px',
    fontSize: '12px',
    color: 'var(--color-sideBar-text-muted)',
  },
};

export default OutlinePanel;