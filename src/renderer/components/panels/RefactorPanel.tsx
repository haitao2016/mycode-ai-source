import React from 'react';
import BasePanel from './BasePanel';

function RefactorPanel(): React.ReactElement {
  return (
    <BasePanel title="重构" icon="🔄">
      <div style={styles.refactor}>
        <div style={styles.placeholder}>重构建议</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  refactor: {
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

export default RefactorPanel;