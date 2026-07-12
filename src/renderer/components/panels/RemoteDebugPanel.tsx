import React from 'react';
import BasePanel from './BasePanel';

function RemoteDebugPanel(): React.ReactElement {
  return (
    <BasePanel title="远程调试" icon="🔗">
      <div style={styles.remote}>
        <div style={styles.placeholder}>远程调试</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  remote: {
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

export default RemoteDebugPanel;