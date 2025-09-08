import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  Panel,
  SelectionMode,
  ReactFlowProvider,
  ConnectionLineType,
} from '@xyflow/react';

import { useDiagramStore } from '../stores/diagramStore';
import { useDiagramManager } from '../stores/diagramManager';
import { C4NodeComponent } from './C4Node';
import { Toolbar } from './Toolbar';
import { Sidebar } from './SidebarSimple';
import { Header } from './Header';

const nodeTypes = {
  c4Node: C4NodeComponent,
};

function DiagramFlow({ isSidebarMinimized, setIsSidebarMinimized }: { 
  isSidebarMinimized: boolean; 
  setIsSidebarMinimized: (value: boolean) => void; 
}) {
  // Integração entre stores
  const { currentDiagramId, updateDiagramName } = useDiagramManager();
  
  const {
    nodes,
    edges,
    diagramName,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setDiagramName,
  } = useDiagramStore();

  // Função integrada para atualizar nome do diagrama
  const handleDiagramNameChange = useCallback((name: string) => {
    setDiagramName(name);
    if (currentDiagramId) {
      updateDiagramName(currentDiagramId, name);
    }
  }, [setDiagramName, currentDiagramId, updateDiagramName]);

  return (
    <div className="diagram-container flex h-screen">
      <Sidebar 
        isMinimized={isSidebarMinimized}
        onToggle={() => setIsSidebarMinimized(!isSidebarMinimized)}
      />
      
      <div className={`diagram-main flex-1 transition-all duration-200 ${isSidebarMinimized ? 'ml-16' : 'ml-80'}`}>
        <Header 
          projectName="T-Draw"
          diagramName={diagramName} 
          onDiagramNameChange={handleDiagramNameChange}
        />
        
        <div className="diagram-content h-full pt-16">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            selectionMode={SelectionMode.Partial}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            className="diagram-flow"
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="top-left">
              <Toolbar />
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export const DiagramPage: React.FC = () => {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  return (
    <ReactFlowProvider>
      <DiagramFlow 
        isSidebarMinimized={isSidebarMinimized}
        setIsSidebarMinimized={setIsSidebarMinimized}
      />
    </ReactFlowProvider>
  );
};
