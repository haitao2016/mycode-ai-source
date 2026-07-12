import React from 'react';
import BasePanel from './BasePanel';

function DebugPanel(): React.ReactElement {
  return (
    <BasePanel title="调试" icon="🐛">
      <div style={styles.debug}>
        <div style={styles.placeholder}>调试面板</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  debug: {
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

export default DebugPanel;