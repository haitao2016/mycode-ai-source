import React from 'react';
import BasePanel from './BasePanel';

function FormPanel(): React.ReactElement {
  return (
    <BasePanel title="表单" icon="📝">
      <div style={styles.form}>
        <div style={styles.placeholder}>表单构建器</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
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

export default FormPanel;