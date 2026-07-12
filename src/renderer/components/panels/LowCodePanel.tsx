import React from 'react';
import BasePanel from './BasePanel';

function LowCodePanel(): React.ReactElement {
  return (
    <BasePanel title="低代码" icon="🧩">
      <div style={styles.lowcode}>
        <div style={styles.placeholder}>低代码编辑器</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  lowcode: {
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

export default LowCodePanel;