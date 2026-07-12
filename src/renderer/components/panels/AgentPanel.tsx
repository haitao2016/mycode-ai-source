import React from 'react';
import BasePanel from './BasePanel';

function AgentPanel(): React.ReactElement {
  return (
    <BasePanel title="代理" icon="🤖">
      <div style={styles.agent}>
        <div style={styles.placeholder}>AI 代理管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  agent: {
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

export default AgentPanel;