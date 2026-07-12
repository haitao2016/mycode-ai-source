import React from 'react';
import BasePanel from './BasePanel';

function RouterPanel(): React.ReactElement {
  return (
    <BasePanel title="路由" icon="🛤️">
      <div style={styles.router}>
        <div style={styles.placeholder}>路由管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  router: {
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

export default RouterPanel;