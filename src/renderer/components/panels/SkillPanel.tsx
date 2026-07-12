import React from 'react';
import BasePanel from './BasePanel';

function SkillPanel(): React.ReactElement {
  return (
    <BasePanel title="技能" icon="✨">
      <div style={styles.skills}>
        <div style={styles.skill}>代码生成</div>
        <div style={styles.skill}>代码优化</div>
        <div style={styles.skill}>Bug 修复</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  skills: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skill: {
    padding: '8px',
    background: 'var(--color-sideBar-hover)',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
};

export default SkillPanel;