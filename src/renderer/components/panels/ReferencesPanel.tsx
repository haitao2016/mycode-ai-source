import React from 'react';

function ReferencesPanel(): React.ReactElement {
  return (
    <div className="panel-container">
      <div className="panel-header">
        <h3>引用</h3>
      </div>
      <div className="panel-content">
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <p>没有找到引用</p>
          <p className="empty-hint">在编辑器中选择一个符号来查看引用</p>
        </div>
      </div>
      <style>{`
        .panel-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
        }
        .panel-header {
          padding: var(--space-3);
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        .panel-header h3 {
          margin: 0;
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--text-primary);
        }
        .panel-content {
          flex: 1;
          overflow: auto;
          padding: var(--space-2);
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
          color: var(--text-tertiary);
        }
        .empty-icon {
          font-size: 24px;
          margin-bottom: var(--space-2);
        }
        .empty-state p {
          margin: var(--space-1) 0;
          font-size: var(--font-size-sm);
        }
        .empty-hint {
          font-size: var(--font-size-xs) !important;
          color: var(--text-muted) !important;
        }
      `}</style>
    </div>
  );
}

export default ReferencesPanel;