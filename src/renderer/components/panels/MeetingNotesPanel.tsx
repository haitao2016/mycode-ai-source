import React from 'react';
import BasePanel from './BasePanel';

function MeetingNotesPanel(): React.ReactElement {
  return (
    <BasePanel title="会议" icon="📹">
      <div style={styles.meeting}>
        <div style={styles.placeholder}>会议记录</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  meeting: {
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

export default MeetingNotesPanel;