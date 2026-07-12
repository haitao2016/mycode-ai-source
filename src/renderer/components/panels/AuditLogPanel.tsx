import React from 'react';
import BasePanel from './BasePanel';

function AuditLogPanel(): React.ReactElement {
  return (
    <BasePanel title="审计" icon="📋">
      <div style={styles.audit}>
        <div style={styles.placeholder}>审计日志</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  audit: {
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

export default AuditLogPanel;