import React from 'react';
import BasePanel from './BasePanel';

function CostTrackingPanel(): React.ReactElement {
  return (
    <BasePanel title="费用" icon="💰">
      <div style={styles.cost}>
        <div style={styles.placeholder}>费用追踪</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  cost: {
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

export default CostTrackingPanel;