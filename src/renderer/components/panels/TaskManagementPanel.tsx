import React from 'react';
import BasePanel from './BasePanel';

function TaskManagementPanel(): React.ReactElement {
  return (
    <BasePanel title="任务" icon="✅">
      <div style={styles.task}>
        <div style={styles.placeholder}>任务管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  task: {
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

export default TaskManagementPanel;