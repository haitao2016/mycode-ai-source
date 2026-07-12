import React from 'react';
import BasePanel from './BasePanel';

function PreviewPanel(): React.ReactElement {
  return (
    <BasePanel title="预览" icon="👁️">
      <div style={styles.preview}>
        <div style={styles.placeholder}>预览区域</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  preview: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-sideBar-hover)',
    borderRadius: '4px',
  },
  placeholder: {
    color: 'var(--color-sideBar-text-muted)',
    fontSize: '14px',
  },
};

export default PreviewPanel;