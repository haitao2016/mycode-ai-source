import React from 'react';
import BasePanel from './BasePanel';

function PropertiesPanel(): React.ReactElement {
  return (
    <BasePanel title="属性" icon="⚙️">
      <div style={styles.properties}>
        <div style={styles.property}>
          <span style={styles.label}>名称</span>
          <span style={styles.value}>main.ts</span>
        </div>
        <div style={styles.property}>
          <span style={styles.label}>类型</span>
          <span style={styles.value}>TypeScript</span>
        </div>
        <div style={styles.property}>
          <span style={styles.label}>大小</span>
          <span style={styles.value}>1.2 KB</span>
        </div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  properties: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  property: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px',
    background: 'var(--color-sideBar-hover)',
    borderRadius: '4px',
  },
  label: {
    fontSize: '12px',
    color: 'var(--color-sideBar-text-muted)',
  },
  value: {
    fontSize: '12px',
    color: 'var(--color-panel-text)',
  },
};

export default PropertiesPanel;