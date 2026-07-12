import React from 'react';
import BasePanel from './BasePanel';

function ExtensionsPanel(): React.ReactElement {
  const extensions = [
    { name: 'MyCode AI Core', version: '1.0.0', enabled: true },
    { name: 'MyCode AI Chat', version: '1.0.0', enabled: true },
    { name: 'MyCode AI Completion', version: '1.0.0', enabled: true },
    { name: 'MyCode AI Review', version: '1.0.0', enabled: false },
  ];

  return (
    <BasePanel title="扩展" icon="📦">
      <div style={styles.extensions}>
        {extensions.map((ext, index) => (
          <div key={index} style={styles.extension}>
            <div style={styles.extName}>{ext.name}</div>
            <div style={styles.extVersion}>{ext.version}</div>
            <div style={{ ...styles.toggle, ...(ext.enabled ? styles.toggleOn : {}) }} />
          </div>
        ))}
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  extensions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  extension: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    background: 'var(--color-sideBar-hover)',
    borderRadius: '4px',
    gap: '8px',
  },
  extName: {
    flex: 1,
    fontSize: '13px',
  },
  extVersion: {
    fontSize: '12px',
    color: 'var(--color-sideBar-text-muted)',
  },
  toggle: {
    width: '32px',
    height: '16px',
    background: 'var(--color-scrollbar-bg)',
    borderRadius: '8px',
    position: 'relative',
  },
  toggleOn: {
    background: 'var(--color-primary)',
  },
};

export default ExtensionsPanel;