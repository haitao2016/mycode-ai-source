import React from 'react';

function OutputPanel(): React.ReactElement {
  return (
    <div style={styles.output}>
      <div style={styles.line}>MyCode AI v1.0.0 启动中...</div>
      <div style={styles.line}>加载扩展: mycode-ai-core</div>
      <div style={styles.line}>加载扩展: mycode-ai-chat</div>
      <div style={styles.line}>加载扩展: mycode-ai-completion</div>
      <div style={styles.line}>应用启动完成</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  output: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: '12px',
    lineHeight: '1.4',
    color: 'var(--color-panel-text)',
  },
  line: {
    padding: '2px 0',
  },
};

export default OutputPanel;