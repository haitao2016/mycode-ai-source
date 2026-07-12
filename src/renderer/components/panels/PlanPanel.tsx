import React from 'react';
import BasePanel from './BasePanel';

function PlanPanel(): React.ReactElement {
  return (
    <BasePanel title="计划" icon="📅">
      <div style={styles.plan}>
        <div style={styles.placeholder}>计划管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  plan: {
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

export default PlanPanel;