import React, { useState, useEffect } from 'react';
import { GitBranch, Bell, CheckCircle2, Wifi, Clock, AlertCircle, AlertTriangle, Battery, HardDrive, Cpu, Zap, FileCode, BookOpen, Layers, Lock, Cloud, Terminal } from 'lucide-react';

function StatusBar(): React.ReactElement {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cpuUsage, setCpuUsage] = useState(25);
  const [memUsage, setMemUsage] = useState(45);
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setCpuUsage(Math.floor(Math.random() * 40) + 10);
      setMemUsage(Math.floor(Math.random() * 30) + 40);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' });
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'var(--color-success)';
    if (batteryLevel > 20) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div className="statusbar">
      <div className="statusbar-left">
        <div className="statusbar-item statusbar-item-badge statusbar-item-git">
          <GitBranch size={13} strokeWidth={1.5} />
          <span>main</span>
        </div>
        <div className="statusbar-divider" />
        <div className="statusbar-item statusbar-item-dot">
          <span className={`statusbar-dot ${isOnline ? 'statusbar-dot-green' : 'statusbar-dot-red'}`} />
          <span>{isOnline ? '已同步' : '离线'}</span>
        </div>
        <div className="statusbar-divider" />
        <div className="statusbar-item statusbar-item-errors">
          <AlertCircle size={12} strokeWidth={1.5} className="statusbar-icon-error" />
          <span className="statusbar-count statusbar-count-error">0</span>
        </div>
        <div className="statusbar-item statusbar-item-warnings">
          <AlertTriangle size={12} strokeWidth={1.5} className="statusbar-icon-warning" />
          <span className="statusbar-count statusbar-count-warning">0</span>
        </div>
        <div className="statusbar-divider" />
        <div className="statusbar-item statusbar-item-indicator">
          <Lock size={11} strokeWidth={1.5} />
          <span>已保存</span>
        </div>
      </div>

      <div className="statusbar-center">
        <div className="statusbar-progress">
          <Cpu size={11} strokeWidth={1.5} className="statusbar-progress-icon" />
          <div className="statusbar-progress-bar">
            <div className="statusbar-progress-fill" style={{ width: `${cpuUsage}%` }} />
          </div>
          <span className="statusbar-progress-label">{cpuUsage}%</span>
        </div>
        <div className="statusbar-progress">
          <HardDrive size={11} strokeWidth={1.5} className="statusbar-progress-icon" />
          <div className="statusbar-progress-bar statusbar-progress-bar-mem">
            <div className="statusbar-progress-fill statusbar-progress-fill-mem" style={{ width: `${memUsage}%` }} />
          </div>
          <span className="statusbar-progress-label">{memUsage}%</span>
        </div>
      </div>

      <div className="statusbar-right">
        <div className="statusbar-item statusbar-item-accent">
          <Zap size={12} strokeWidth={1.5} />
          <span>MyCode AI</span>
        </div>
        <div className="statusbar-divider" />
        <div className="statusbar-item statusbar-item-editor">
          <FileCode size={10} strokeWidth={1.5} />
          <span>Ln 1, Col 1</span>
        </div>
        <div className="statusbar-divider" />
        <div className="statusbar-item statusbar-item-editor">
          <span>UTF-8</span>
        </div>
        <div className="statusbar-divider" />
        <div className="statusbar-item statusbar-item-editor">
          <BookOpen size={10} strokeWidth={1.5} />
          <span>TypeScript</span>
        </div>
        <div className="statusbar-divider" />
        <div className="statusbar-item statusbar-item-editor">
          <Layers size={10} strokeWidth={1.5} />
          <span>空格: 2</span>
        </div>
        <div className="statusbar-divider" />
        <div className="statusbar-item statusbar-item-network">
          <Wifi size={10} strokeWidth={1.5} className={isOnline ? '' : 'statusbar-icon-disabled'} />
          <span>{isOnline ? 'Wi-Fi' : '离线'}</span>
        </div>
        <div className="statusbar-divider" />
        <div className="statusbar-item statusbar-item-battery">
          <Battery size={12} strokeWidth={1.5} style={{ color: getBatteryColor() }} />
          <span style={{ color: getBatteryColor() }}>{batteryLevel}%</span>
        </div>
        <div className="statusbar-divider" />
        <div className="statusbar-item statusbar-item-clock">
          <span className="statusbar-date">{formatDate(currentTime)}</span>
          <div className="statusbar-divider statusbar-divider-vertical" />
          <Clock size={12} strokeWidth={1.5} />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      <style>{`
        .statusbar {
          height: var(--statusbar-height);
          min-height: var(--statusbar-height);
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          user-select: none;
          flex-shrink: 0;
          position: relative;
        }
        .statusbar-left,
        .statusbar-right {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
        }
        .statusbar-right {
          justify-content: flex-end;
        }
        .statusbar-center {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        .statusbar-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: 0 var(--space-2);
          height: 100%;
          cursor: default;
          transition: all var(--duration-instant) var(--ease-out);
          white-space: nowrap;
          border-radius: var(--radius-xs);
        }
        .statusbar-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .statusbar-item-badge {
          background: var(--bg-tertiary);
          padding: 0 var(--space-3);
        }
        .statusbar-item-badge:hover {
          background: var(--bg-hover);
        }
        .statusbar-item-accent {
          background: var(--color-accent-bg);
          color: var(--color-accent);
          padding: 0 var(--space-3);
          font-weight: 500;
        }
        .statusbar-item-accent:hover {
          background: var(--color-accent);
          color: var(--text-inverse);
        }
        .statusbar-item-git {
          color: var(--text-secondary);
        }
        .statusbar-item-dot {
          gap: 4px;
        }
        .statusbar-item-indicator {
          gap: 3px;
          font-size: 11px;
        }
        .statusbar-item-network {
          gap: 3px;
        }
        .statusbar-item-battery {
          gap: 3px;
        }
        .statusbar-item-clock {
          gap: 4px;
          color: var(--text-secondary);
        }
        .statusbar-date {
          font-size: 10px;
          color: var(--text-tertiary);
        }
        .statusbar-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: all var(--duration-fast);
        }
        .statusbar-dot-green {
          background: var(--color-success);
          box-shadow: 0 0 6px rgba(52, 211, 153, 0.4);
        }
        .statusbar-dot-red {
          background: var(--color-error);
          box-shadow: 0 0 6px rgba(248, 113, 113, 0.4);
          animation: statusbarPulse 1s var(--ease-in-out) infinite;
        }
        .statusbar-dot-yellow {
          background: var(--color-warning);
          box-shadow: 0 0 6px rgba(251, 191, 36, 0.4);
        }
        .statusbar-item-errors,
        .statusbar-item-warnings {
          gap: 3px;
        }
        .statusbar-icon-error {
          color: var(--color-error);
        }
        .statusbar-icon-warning {
          color: var(--color-warning);
        }
        .statusbar-icon-disabled {
          color: var(--text-muted);
        }
        .statusbar-count {
          font-weight: 600;
          font-size: 11px;
          min-width: 14px;
          text-align: center;
        }
        .statusbar-count-success {
          color: var(--color-success);
        }
        .statusbar-count-warning {
          color: var(--color-warning);
        }
        .statusbar-count-error {
          color: var(--color-error);
        }
        .statusbar-divider {
          width: 1px;
          height: 14px;
          background: var(--border-default);
          margin: 0 2px;
        }
        .statusbar-divider-vertical {
          height: 10px;
        }
        .statusbar-progress {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
        .statusbar-progress-icon {
          color: var(--text-tertiary);
        }
        .statusbar-progress-bar {
          width: 40px;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }
        .statusbar-progress-bar-mem {
          width: 50px;
        }
        .statusbar-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-success), var(--color-info));
          border-radius: 2px;
          transition: width var(--duration-slow) var(--ease-out);
        }
        .statusbar-progress-fill-mem {
          background: linear-gradient(90deg, var(--color-warning), var(--color-accent));
        }
        .statusbar-progress-label {
          font-size: 10px;
          color: var(--text-tertiary);
          min-width: 28px;
          text-align: right;
        }
        .statusbar-item-editor {
          color: var(--text-tertiary);
          gap: 3px;
        }
        @keyframes statusbarPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default StatusBar;