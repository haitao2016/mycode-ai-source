import React from 'react';
import BasePanel from './BasePanel';

function SemanticSearchPanel(): React.ReactElement {
  return (
    <BasePanel title="语义搜索" icon="🔍">
      <div style={styles.semantic}>
        <div style={styles.placeholder}>语义搜索</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  semantic: {
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

export default SemanticSearchPanel;