import React from 'react';
import BasePanel from './BasePanel';

function KnowledgeBasePanel(): React.ReactElement {
  return (
    <BasePanel title="知识库" icon="📚">
      <div style={styles.knowledge}>
        <div style={styles.placeholder}>知识库管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  knowledge: {
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

export default KnowledgeBasePanel;