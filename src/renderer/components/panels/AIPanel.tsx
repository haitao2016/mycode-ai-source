import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

function AIPanel(): React.ReactElement {
  const { aiSessions, activeAISessionId, createAISession, addAIMessage } = useStore();
  const [input, setInput] = useState('');

  const session = aiSessions.find((s) => s.id === activeAISessionId);

  const handleSend = () => {
    if (!input.trim() || !activeAISessionId) return;
    addAIMessage(activeAISessionId, input, 'user');
    setTimeout(() => {
      addAIMessage(activeAISessionId, '这是 AI 的回复内容。', 'assistant');
    }, 500);
    setInput('');
  };

  const handleNewSession = () => {
    createAISession();
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>AI 助手</span>
        <button style={styles.newBtn} onClick={handleNewSession}>+ 新会话</button>
      </div>
      <div style={styles.sessions}>
        {aiSessions.map((s) => (
          <button
            key={s.id}
            style={{
              ...styles.sessionBtn,
              ...(s.id === activeAISessionId ? styles.sessionActive : {}),
            }}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div style={styles.messages}>
        {session?.messages.map((msg) => (
          <div key={msg.id} style={{ ...styles.message, ...(msg.role === 'user' ? styles.userMsg : {}) }}>
            <div style={styles.content}>{msg.content}</div>
          </div>
        ))}
        {!session?.messages.length && (
          <div style={styles.welcome}>
            <div style={styles.welcomeIcon}>✨</div>
            <div style={styles.welcomeText}>欢迎使用 MyCode AI</div>
            <div style={styles.welcomeSub}>询问代码问题、生成代码、或获取开发建议</div>
          </div>
        )}
      </div>
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入你的问题..."
        />
        <button style={styles.sendBtn} onClick={handleSend}>发送</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'var(--color-panel-header)',
    borderBottom: '1px solid var(--color-sideBar-border)',
  },
  title: {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: 'var(--color-sideBar-text-muted)',
  },
  newBtn: {
    padding: '4px 8px',
    background: 'var(--color-primary)',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
  },
  sessions: {
    display: 'flex',
    gap: '4px',
    padding: '8px',
    borderBottom: '1px solid var(--color-sideBar-border)',
    overflowX: 'auto',
  },
  sessionBtn: {
    padding: '4px 8px',
    background: 'var(--color-sideBar-hover)',
    border: 'none',
    borderRadius: '4px',
    color: 'var(--color-panel-text)',
    cursor: 'pointer',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  sessionActive: {
    background: 'var(--color-primary)',
    color: 'white',
  },
  messages: {
    flex: 1,
    overflow: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  message: {
    padding: '8px',
    background: 'var(--color-sideBar-hover)',
    borderRadius: '8px',
  },
  userMsg: {
    background: 'var(--color-primary-light)',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  content: {
    fontSize: '13px',
    color: 'var(--color-panel-text)',
  },
  welcome: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    color: 'var(--color-sideBar-text-muted)',
  },
  welcomeIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  welcomeText: {
    fontSize: '16px',
    color: 'var(--color-panel-text)',
    marginBottom: '8px',
  },
  welcomeSub: {
    fontSize: '12px',
    textAlign: 'center',
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderTop: '1px solid var(--color-sideBar-border)',
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
  sendBtn: {
    padding: '8px 16px',
    background: 'var(--color-primary)',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default AIPanel;