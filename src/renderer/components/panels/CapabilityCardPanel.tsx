import React from 'react';
import BasePanel from './BasePanel';

function CapabilityCardPanel(): React.ReactElement {
  return (
    <BasePanel title="能力" icon="⭐">
      <div style={styles.capability}>
        <div style={styles.placeholder}>能力卡片</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  capability: {
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

export default CapabilityCardPanel;