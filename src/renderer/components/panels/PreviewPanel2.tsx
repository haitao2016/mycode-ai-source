import React from 'react';

function PreviewPanel2(): React.ReactElement {
  return (
    <div style={styles.container}>
      <div style={styles.header}>预览面板</div>
      <div style={styles.content}>
        <div style={styles.placeholder}>
          <div style={styles.icon}>👁️</div>
          <div style={styles.text}>预览内容将在此显示</div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-panel-text-secondary)',
    borderBottom: '1px solid var(--color-panel-border)',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    textAlign: 'center',
    color: 'var(--color-panel-text-secondary)',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  text: {
    fontSize: '14px',
  },
};

export default PreviewPanel2;