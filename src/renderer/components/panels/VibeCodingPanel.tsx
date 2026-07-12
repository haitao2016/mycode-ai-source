import React from 'react';
import BasePanel from './BasePanel';

function VibeCodingPanel(): React.ReactElement {
  return (
    <BasePanel title="Vibe" icon="🎵">
      <div style={styles.vibe}>
        <div style={styles.placeholder}>Vibe Coding</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  vibe: {
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

export default VibeCodingPanel;