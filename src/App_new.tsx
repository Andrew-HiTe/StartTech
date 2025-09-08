import React, { useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type NodeChange,
  type EdgeChange,
  ConnectionMode,
  Panel,
  SelectionMode,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';

import { useDiagramStore, type C4Node } from './stores/diagramStore';
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
    setSelectedElements,
    setCurrentTool,
  } = useDiagramStore();

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      onConnect(connection);
    },
    [onConnect]
  );

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (currentTool === 'add-table') {
        // Usar screenToFlowPosition para converter coordenadas da tela para o canvas
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        
        // Aplicar offset fixo para centralizar (valores definidos pelo usuário)
        const finalPosition = {
          x: position.x - 100, // Offset X fixo
          y: position.y - 55,  // Offset Y fixo
        };
        
        // Adicionar a nova tabela
        addNode(finalPosition);
        
        // Voltar automaticamente para o modo selecionar
        setCurrentTool('select');
      }
    },
    [currentTool, addNode, setCurrentTool, reactFlowInstance]
  );

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: C4Node[] }) => {
      setSelectedElements(selectedNodes.map(node => node.id));
    },
    [setSelectedElements]
  );

  return (
    <div className="h-screen w-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isMinimized={isSidebarMinimized}
        onToggle={() => setIsSidebarMinimized(!isSidebarMinimized)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          projectName="T-Draw"
          diagramName={getCurrentDiagram()?.name || diagramName}
        />
        
        {/* Diagram Area */}
        <div className="flex-1 relative w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onPaneClick={handlePaneClick}
            onSelectionChange={handleSelectionChange}
            connectionMode={ConnectionMode.Loose}
            defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
            fitView
            selectionMode={SelectionMode.Partial}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap />
            
            {/* Toolbar de Ferramentas */}
            <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-2 m-4">
              <Toolbar />
            </Panel>
            
            {/* Panel com informações do diagrama (canto inferior direito) */}
            <Panel position="bottom-right" className="bg-white rounded-lg shadow-lg p-3 m-4 text-sm">
              <div className="font-medium text-gray-800">{getCurrentDiagram()?.name || diagramName}</div>
              <div className="text-xs mt-2 pt-2 border-t">
                <div>{nodes.length} tabela(s) • {edges.length} conexão(ões)</div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

// Componente do Diagrama Original (sem modificações)
function DiagramApp() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  
  return (
    <div className="diagram-app">
      <ReactFlowProvider>
        <DiagramFlow 
          isSidebarMinimized={isSidebarMinimized}
          setIsSidebarMinimized={setIsSidebarMinimized}
        />
      </ReactFlowProvider>
    </div>
  );
}

// Componente principal com roteamento
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/diagram" element={<DiagramApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
