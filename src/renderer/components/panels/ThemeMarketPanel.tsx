import React from 'react';
import BasePanel from './BasePanel';

function ThemeMarketPanel(): React.ReactElement {
  return (
    <BasePanel title="主题" icon="🎨">
      <div style={styles.theme}>
        <div style={styles.placeholder}>主题市场</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  theme: {
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

export default ThemeMarketPanel;