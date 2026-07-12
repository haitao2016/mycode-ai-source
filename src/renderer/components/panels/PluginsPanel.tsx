import React from 'react';
import BasePanel from './BasePanel';

function PluginsPanel(): React.ReactElement {
  return (
    <BasePanel title="插件" icon="🔌">
      <div style={styles.plugins}>
        <div style={styles.placeholder}>插件管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  plugins: {
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

export default PluginsPanel;