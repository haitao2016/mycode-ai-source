import React from 'react';
import BasePanel from './BasePanel';

function TemplateGalleryPanel(): React.ReactElement {
  return (
    <BasePanel title="模板" icon="📄">
      <div style={styles.template}>
        <div style={styles.placeholder}>模板库</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  template: {
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

export default TemplateGalleryPanel;