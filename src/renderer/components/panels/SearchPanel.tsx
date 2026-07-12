import React from 'react';
import BasePanel from './BasePanel';

function SearchPanel(): React.ReactElement {
  return (
    <BasePanel title="搜索" icon="🔍">
      <div style={styles.searchBox}>
        <input style={styles.input} placeholder="搜索文件..." />
        <button style={styles.searchButton}>🔍</button>
      </div>
      <div style={styles.results}>
        <div style={styles.resultItem}>src/main.ts</div>
        <div style={styles.resultItem}>src/index.html</div>
        <div style={styles.resultItem}>package.json</div>
      </div>
    </BasePanel>
  );
}

const styles: Record<string, React.CSSProperties> = {
  searchBox: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  input: {
    flex: 1,
    padding: '8px',
    background: 'var(--color-sideBar-hover)',
    border: '1px solid var(--color-sideBar-border)',
    borderRadius: '4px',
    color: 'var(--color-panel-text)',
    fontSize: '13px',
  },
  searchButton: {
    padding: '8px 12px',
    background: 'var(--color-primary)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  resultItem: {
    padding: '8px',
    background: 'var(--color-sideBar-hover)',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
};

export default SearchPanel;