import React from 'react';
import BasePanel from './BasePanel';

function CodeCoveragePanel(): React.ReactElement {
  return (
    <BasePanel title="代码覆盖率" icon="📊">
      <div style={styles.coverage}>
        <div style={styles.placeholder}>代码覆盖率</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  coverage: {
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

export default CodeCoveragePanel;