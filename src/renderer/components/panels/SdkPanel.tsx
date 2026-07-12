import React from 'react';
import BasePanel from './BasePanel';

function SdkPanel(): React.ReactElement {
  return (
    <BasePanel title="API" icon="📡">
      <div style={styles.sdk}>
        <div style={styles.placeholder}>SDK 管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sdk: {
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

export default SdkPanel;