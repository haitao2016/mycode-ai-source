import React from 'react';
import BasePanel from './BasePanel';

function CMakePanel(): React.ReactElement {
  return (
    <BasePanel title="CMake" icon="🧱">
      <div style={styles.cmake}>
        <div style={styles.placeholder}>CMake 管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  cmake: {
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

export default CMakePanel;