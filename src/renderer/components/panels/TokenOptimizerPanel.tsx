import React from 'react';
import BasePanel from './BasePanel';

function TokenOptimizerPanel(): React.ReactElement {
  return (
    <BasePanel title="Token" icon="🪙">
      <div style={styles.token}>
        <div style={styles.placeholder}>Token 优化</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  token: {
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

export default TokenOptimizerPanel;