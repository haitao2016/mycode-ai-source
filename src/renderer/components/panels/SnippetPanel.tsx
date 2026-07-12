import React from 'react';
import BasePanel from './BasePanel';

function SnippetPanel(): React.ReactElement {
  return (
    <BasePanel title="代码片段" icon="📝">
      <div style={styles.snippet}>
        <div style={styles.placeholder}>代码片段</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  snippet: {
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

export default SnippetPanel;