import React from 'react';
import BasePanel from './BasePanel';

function TapTapPanel(): React.ReactElement {
  return (
    <BasePanel title="Tap" icon="👆">
      <div style={styles.tap}>
        <div style={styles.placeholder}>TapTap 集成</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tap: {
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

export default TapTapPanel;