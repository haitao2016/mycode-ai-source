import React from 'react';
import BasePanel from './BasePanel';

function DatabaseViewPanel(): React.ReactElement {
  return (
    <BasePanel title="数据库" icon="🗄️">
      <div style={styles.db}>
        <div style={styles.placeholder}>数据库视图</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  db: {
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

export default DatabaseViewPanel;