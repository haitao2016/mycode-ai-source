import React from 'react';
import BasePanel from './BasePanel';

function GitPanel(): React.ReactElement {
  return (
    <BasePanel title="源代码管理" icon="🌿">
      <div style={styles.status}>
        <div style={styles.statusItem}>分支: main</div>
        <div style={styles.statusItem}>提交: a1b2c3d</div>
        <div style={styles.statusItem}>未暂存: 2</div>
        <div style={styles.statusItem}>已暂存: 1</div>
      </div>
      <div style={styles.buttons}>
        <button style={styles.btn}>提交</button>
        <button style={styles.btn}>推送</button>
        <button style={styles.btn}>拉取</button>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  status: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  statusItem: {
    padding: '6px',
    background: 'var(--color-sideBar-hover)',
    borderRadius: '4px',
    fontSize: '12px',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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

export default GitPanel;