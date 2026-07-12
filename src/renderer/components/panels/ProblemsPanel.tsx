import React from 'react';

function ProblemsPanel(): React.ReactElement {
  return (
    <div style={styles.problems}>
      <div style={styles.empty}>暂无问题</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  problems: {
    fontSize: '12px',
    color: 'var(--color-panel-text)',
  },
  empty: {
    color: 'var(--color-sideBar-text-muted)',
  },
};

export default ProblemsPanel;