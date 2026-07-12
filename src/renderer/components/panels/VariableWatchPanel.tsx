import React from 'react';
import BasePanel from './BasePanel';

function VariableWatchPanel(): React.ReactElement {
  return (
    <BasePanel title="变量" icon="🔢">
      <div style={styles.variable}>
        <div style={styles.placeholder}>变量监视</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  variable: {
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

export default VariableWatchPanel;