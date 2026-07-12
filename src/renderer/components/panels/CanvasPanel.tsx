import React from 'react';
import BasePanel from './BasePanel';

function CanvasPanel(): React.ReactElement {
  return (
    <BasePanel title="画布" icon="🎭">
      <div style={styles.canvas}>
        <div style={styles.placeholder}>画布编辑器</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  canvas: {
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

export default CanvasPanel;