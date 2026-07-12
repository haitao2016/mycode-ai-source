import React from 'react';

interface BasePanelProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

function BasePanel({ title, icon, children }: BasePanelProps): React.ReactElement {
  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        {icon && <span style={styles.icon}>{icon}</span>}
        <span style={styles.title}>{title}</span>
      </div>
      <div style={styles.content}>{children}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: 'var(--color-panel-header)',
    borderBottom: '1px solid var(--color-sideBar-border)',
  },
  icon: {
    fontSize: '14px',
    marginRight: '8px',
  },
  title: {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'var(--color-sideBar-text-muted)',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '12px',
  },
};

export default BasePanel;