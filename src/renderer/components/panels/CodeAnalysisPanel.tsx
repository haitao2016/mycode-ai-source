import React from 'react';
import BasePanel from './BasePanel';

function CodeAnalysisPanel(): React.ReactElement {
  return (
    <BasePanel title="代码分析" icon="📈">
      <div style={styles.analysis}>
        <div style={styles.placeholder}>代码分析</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  analysis: {
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

export default CodeAnalysisPanel;