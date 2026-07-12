import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Paperclip } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function AIChatPanel(): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是 MyCode AI 助手，有什么可以帮你的？你可以问我代码问题、请求重构建议，或者让我帮你生成代码。',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '收到你的消息！我正在分析你的需求，很快就会给你回复。',
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="aichat">
      <div className="aichat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`aichat-msg aichat-msg-${msg.role}`}>
            <div className={`aichat-avatar aichat-avatar-${msg.role}`}>
              {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
            </div>
            <div className="aichat-bubble">
              <div className="aichat-bubble-content">{msg.content}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="aichat-msg aichat-msg-assistant">
            <div className="aichat-avatar aichat-avatar-assistant">
              <Sparkles size={14} />
            </div>
            <div className="aichat-bubble aichat-bubble-typing">
              <span className="aichat-dot" />
              <span className="aichat-dot" />
              <span className="aichat-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="aichat-input-area">
        <div className="aichat-input-wrapper">
          <textarea
            className="aichat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            rows={1}
          />
          <div className="aichat-input-actions">
            <button className="btn-icon" title="附件">
              <Paperclip size={15} />
            </button>
            <button
              className="aichat-send"
              onClick={sendMessage}
              disabled={!input.trim()}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .aichat {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .aichat-messages {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .aichat-msg {
          display: flex;
          gap: var(--space-2);
          max-width: 100%;
          animation: fadeIn var(--duration-normal) var(--ease-out);
        }
        .aichat-msg-user {
          flex-direction: row-reverse;
        }
        .aichat-avatar {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .aichat-avatar-user {
          background: var(--bg-layer-4);
          color: var(--text-secondary);
        }
        .aichat-avatar-assistant {
          background: var(--color-accent);
          color: white;
          box-shadow: 0 0 8px var(--color-accent-glow);
        }
        .aichat-bubble {
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-lg);
          max-width: calc(100% - 40px);
          min-width: 0;
        }
        .aichat-msg-assistant .aichat-bubble {
          background: var(--bg-layer-2);
          border: 1px solid var(--border-subtle);
          border-top-left-radius: var(--radius-sm);
        }
        .aichat-msg-user .aichat-bubble {
          background: var(--color-accent-muted);
          border: 1px solid rgba(108, 92, 231, 0.2);
          border-top-right-radius: var(--radius-sm);
        }
        .aichat-bubble-content {
          font-size: var(--font-size-sm);
          line-height: 1.6;
          color: var(--text-primary);
          word-break: break-word;
        }
        .aichat-bubble-typing {
          display: flex;
          gap: 4px;
          padding: var(--space-3) var(--space-4);
        }
        .aichat-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-accent);
          animation: pulse 1.4s infinite ease-in-out;
        }
        .aichat-dot:nth-child(2) { animation-delay: 0.2s; }
        .aichat-dot:nth-child(3) { animation-delay: 0.4s; }

        .aichat-input-area {
          padding: var(--space-2) var(--space-3);
          border-top: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        .aichat-input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: var(--space-2);
          background: var(--bg-layer-2);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-1) var(--space-2);
          transition: border-color var(--duration-fast) var(--ease-out),
                      box-shadow var(--duration-fast) var(--ease-out);
        }
        .aichat-input-wrapper:focus-within {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-muted);
        }
        .aichat-input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          resize: none;
          outline: none;
          line-height: 1.5;
          max-height: 120px;
          padding: var(--space-1) 0;
        }
        .aichat-input::placeholder {
          color: var(--text-muted);
        }
        .aichat-input-actions {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          flex-shrink: 0;
        }
        .aichat-send {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--color-accent);
          border: none;
          border-radius: var(--radius-md);
          color: white;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
        }
        .aichat-send:hover:not(:disabled) {
          background: var(--color-accent-hover);
          box-shadow: var(--shadow-glow);
        }
        .aichat-send:disabled {
          opacity: 0.3;
          cursor: default;
        }
      `}</style>
    </div>
  );
}

export default AIChatPanel;
