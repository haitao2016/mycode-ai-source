import React from 'react';
import { useStore } from '../../store/useStore';
import Toolbar from './Toolbar';
import ActivityBar from './ActivityBar';
import Sidebar from './Sidebar';
import Editor from './Editor';
import RightPanel from './RightPanel';
import BottomPanel from './BottomPanel';
import StatusBar from './StatusBar';

function App(): React.ReactElement {
  const { sidebarWidth, isBottomPanelVisible, bottomPanelHeight, isRightPanelVisible, rightPanelWidth } = useStore();

  return (
    <div className="app-shell">
      <Toolbar />
      <div className="app-workspace">
        <ActivityBar />
        <Sidebar width={sidebarWidth} />
        <Editor
          bottomPanelHeight={isBottomPanelVisible ? bottomPanelHeight : 0}
          rightPanelWidth={isRightPanelVisible ? rightPanelWidth : 0}
        />
        {isRightPanelVisible && <RightPanel width={rightPanelWidth} />}
      </div>
      {isBottomPanelVisible && <BottomPanel height={bottomPanelHeight} />}
      <StatusBar />

      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: var(--font-size-base);
        }
        .app-workspace {
          flex: 1;
          display: flex;
          overflow: hidden;
          min-height: 0;
        }
      `}</style>
    </div>
  );
}

export default App;