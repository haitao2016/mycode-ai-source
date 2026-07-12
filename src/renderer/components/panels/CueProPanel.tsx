import React from 'react';
import BasePanel from './BasePanel';

function CueProPanel(): React.ReactElement {
  return (
    <BasePanel title="Cue" icon="🎯">
      <div style={styles.cue}>
        <div style={styles.placeholder}>Cue 管理</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  cue: {
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

export default CueProPanel;