import React from 'react';
import BasePanel from './BasePanel';

function BlockEditorPanel(): React.ReactElement {
  return (
    <BasePanel title="块编辑器" icon="🧱">
      <div style={styles.block}>
        <div style={styles.placeholder}>块编辑器</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  block: {
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

export default BlockEditorPanel;