import React from 'react';
import BasePanel from './BasePanel';

function CodeReviewPanel(): React.ReactElement {
  return (
    <BasePanel title="代码审查" icon="🔍">
      <div style={styles.review}>
        <div style={styles.placeholder}>代码审查结果</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  review: {
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

export default CodeReviewPanel;