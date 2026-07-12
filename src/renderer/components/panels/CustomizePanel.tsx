import React from 'react';
import BasePanel from './BasePanel';

function CustomizePanel(): React.ReactElement {
  return (
    <BasePanel title="自定义" icon="⚙️">
      <div style={styles.customize}>
        <div style={styles.placeholder}>自定义设置</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  customize: {
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

export default CustomizePanel;