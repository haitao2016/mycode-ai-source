import React from 'react';
import BasePanel from './BasePanel';

function MemoryPanel(): React.ReactElement {
  return (
    <BasePanel title="记忆" icon="🧠">
      <div style={styles.memory}>
        <div style={styles.placeholder}>AI 记忆存储</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  memory: {
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

export default MemoryPanel;