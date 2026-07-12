import React from 'react';
import BasePanel from './BasePanel';

function ComposerPanel(): React.ReactElement {
  return (
    <BasePanel title="Composer" icon="🎵">
      <div style={styles.composer}>
        <div style={styles.placeholder}>AI 代码合成器</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  composer: {
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

export default ComposerPanel;