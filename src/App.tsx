import React, { useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  SelectionMode,
  ReactFlowProvider,
  useReactFlow,
  ConnectionLineType,
  ConnectionMode,
} from '@xyflow/react';

import { useDiagramStore } from './stores/diagramStore';
import { useDiagramIntegration } from './stores/useDiagramIntegration';
import { C4NodeComponent } from './components/C4Node';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/SidebarSimple';
import { Header } from './components/Header';

// Componentes das páginas
import { Home } from './components/home/Home';
import { LoginForm } from './components/auth/LoginForm';

import './App.css';

const nodeTypes = {
  c4Node: C4NodeComponent,
};

function DiagramFlow({ isSidebarMinimized, setIsSidebarMinimized }: { 
  isSidebarMinimized: boolean; 
  setIsSidebarMinimized: (value: boolean) => void; 
}) {
  const reactFlowInstance = useReactFlow();
  
  // Integração entre stores
  const { getCurrentDiagram } = useDiagramIntegration();
  
  const {
    nodes,
    edges,
    currentTool,
    diagramName,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    addNodeWithSize,
    setDiagramName,
  } = useDiagramStore();
  
  // Estado para criação de tabelas arrastando
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableCreationStart, setTableCreationStart] = useState<{ x: number; y: number } | null>(null);
  const [tableCreationEnd, setTableCreationEnd] = useState<{ x: number; y: number } | null>(null);
  const [isMiddleMousePressed, setIsMiddleMousePressed] = useState(false);

  const handleDiagramNameChange = useCallback((newName: string) => {
    setDiagramName(newName);
    // saveDiagramData pode ser chamado quando necessário
  }, [setDiagramName]);

  const nodesConnectable = currentTool === 'select';

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 1) { // Middle mouse button
      event.preventDefault();
      setIsMiddleMousePressed(true);
      
      if (currentTool === 'add-table') {
        const rect = event.currentTarget.getBoundingClientRect();
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        
        setIsCreatingTable(true);
        setTableCreationStart(position);
        setTableCreationEnd(position);
      }
    }
  }, [currentTool, reactFlowInstance]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isCreatingTable && tableCreationStart && isMiddleMousePressed) {
      const rect = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      
      setTableCreationEnd(position);
    }
  }, [isCreatingTable, tableCreationStart, isMiddleMousePressed, reactFlowInstance]);

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    if (event.button === 1 && isCreatingTable && tableCreationStart && tableCreationEnd) {
      const width = Math.abs(tableCreationEnd.x - tableCreationStart.x);
      const height = Math.abs(tableCreationEnd.y - tableCreationStart.y);
      
      if (width > 20 && height > 20) {
        const nodePosition = {
          x: Math.min(tableCreationStart.x, tableCreationEnd.x),
          y: Math.min(tableCreationStart.y, tableCreationEnd.y),
        };
        
        addNodeWithSize(nodePosition, { width, height });
      }
      
      setIsCreatingTable(false);
      setTableCreationStart(null);
      setTableCreationEnd(null);
    }
    
    if (event.button === 1) {
      setIsMiddleMousePressed(false);
    }
  }, [isCreatingTable, tableCreationStart, tableCreationEnd, addNode]);

  const renderTableCreationOverlay = () => {
    if (!isCreatingTable || !tableCreationStart || !tableCreationEnd) return null;

    const x = Math.min(tableCreationStart.x, tableCreationEnd.x);
    const y = Math.min(tableCreationStart.y, tableCreationEnd.y);
    const width = Math.abs(tableCreationEnd.x - tableCreationStart.x);
    const height = Math.abs(tableCreationEnd.y - tableCreationStart.y);

    return (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width,
          height,
          border: '2px dashed #3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />
    );
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar 
          isMinimized={isSidebarMinimized}
          onToggle={() => setIsSidebarMinimized(!isSidebarMinimized)}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header 
            projectName="T-Draw"
            diagramName={getCurrentDiagram()?.name || diagramName}
            onDiagramNameChange={handleDiagramNameChange}
          />
          
          {/* Diagram Area */}
          <div className="flex-1 relative w-full h-full">
            <div
              className="w-full h-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
                selectionMode={SelectionMode.Partial}
                panOnScroll={currentTool === 'select'}
                panOnDrag={currentTool === 'select'}
                zoomOnScroll={currentTool === 'select'}
                zoomOnPinch={currentTool === 'select'}
                zoomOnDoubleClick={currentTool === 'select'}
                selectNodesOnDrag={currentTool === 'select'}
                nodesConnectable={nodesConnectable}
                nodesDraggable={currentTool === 'select'}
                edgesReconnectable={currentTool === 'select'}
                connectionLineType={ConnectionLineType.SmoothStep}
                className={
                  isMiddleMousePressed 
                    ? 'middle-mouse-dragging'
                    : 'cursor-default'
                }
              >
                <Background />
                <Controls />
                <MiniMap 
                  nodeColor={(node) => {
                    switch (node.data?.type) {
                      case 'person': return '#10b981';
                      case 'system': return '#3b82f6';
                      case 'container': return '#f59e0b';
                      case 'database': return '#ef4444';
                      default: return '#6b7280';
                    }
                  }}
                  nodeStrokeWidth={3}
                  pannable
                  zoomable
                  className="bg-white border border-gray-300 rounded"
                />
                <Panel position="top-left">
                  <Toolbar />
                </Panel>
              </ReactFlow>
              {renderTableCreationOverlay()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route 
          path="/diagram" 
          element={
            <ReactFlowProvider>
              <DiagramFlow 
                isSidebarMinimized={isSidebarMinimized}
                setIsSidebarMinimized={setIsSidebarMinimized}
              />
            </ReactFlowProvider>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
