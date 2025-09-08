import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  Panel,
  SelectionMode,
  ReactFlowProvider,
  useReactFlow,
  ConnectionLineType,
} from '@xyflow/react';

import { useDiagramStore } from './stores/diagramStore.js';
import { useDiagramIntegration } from './stores/useDiagramIntegration.js';
import { useDiagramManager } from './stores/diagramManager.js';
import { C4NodeComponent } from './components/C4Node.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import { Sidebar } from './components/SidebarSimple.jsx';
import { Header } from './components/Header.jsx';

const nodeTypes = {
  c4Node: C4NodeComponent,
};

function DiagramFlow({ isSidebarMinimized, setIsSidebarMinimized }) {
  const reactFlowInstance = useReactFlow();
  const [isDraggingWithMiddleMouse, setIsDraggingWithMiddleMouse] = useState(false);
  
  // Integração entre stores
  const { getCurrentDiagram } = useDiagramIntegration();
  const { currentDiagramId, updateDiagramName } = useDiagramManager();
  
  const {
    nodes,
    edges,
    currentTool,
    diagramName,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNodeWithSize,
    setSelectedElements,
    setCurrentTool,
    setDiagramName
  } = useDiagramStore();

  const proOptions = { hideAttribution: true };

  // Handler para conectar nós
  const handleConnect = useCallback(
    (connection) => {
      console.log('🔗 Conectando nós:', connection);
      onConnect(connection);
    },
    [onConnect]
  );

  // Handler SIMPLIFICADO para criação de nós - apenas clique
  const handlePaneClick = useCallback(
    (event) => {
      if (currentTool === 'add-table' && reactFlowInstance) {
        console.log('🔧 Criando nó por clique...');
        
        try {
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          
          // Verificar se não há nó muito próximo (evitar duplicação)
          const tooClose = nodes.some(node => {
            const distance = Math.sqrt(
              Math.pow(node.position.x - position.x, 2) + 
              Math.pow(node.position.y - position.y, 2)
            );
            return distance < 80; // Distância mínima de 80px
          });
          
          if (tooClose) {
            console.log('⚠️ Nó muito próximo, criação cancelada');
            return;
          }
          
          // Centralizar a tabela no ponto de clique
          const finalPosition = {
            x: position.x - 90,
            y: position.y - 60,
          };
          
          // Criar o nó
          addNodeWithSize(finalPosition, { width: 180, height: 120 });
          
          console.log('✅ Nó criado com sucesso');
          
          // Voltar para modo seleção
          setCurrentTool('select');
        } catch (error) {
          console.error('❌ Erro ao criar nó:', error);
        }
      }
    },
    [currentTool, addNodeWithSize, setCurrentTool, reactFlowInstance, nodes]
  );

  // Handlers básicos de mouse
  const handlePaneMouseDown = useCallback((event) => {
    if (event.button === 1) {
      setIsDraggingWithMiddleMouse(true);
    }
  }, []);

  const handlePaneMouseUp = useCallback((event) => {
    if (event.button === 1) {
      setIsDraggingWithMiddleMouse(false);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDraggingWithMiddleMouse(false);
  }, []);

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      const selectedElementIds = [
        ...selectedNodes.map(node => node.id),
        ...selectedEdges.map(edge => edge.id)
      ];
      setSelectedElements(selectedElementIds);
    },
    [setSelectedElements]
  );

  // Configurações de pan e drag
  const panOnDrag = useMemo(() => {
    return currentTool === 'select' ? [1, 2] : false;
  }, [currentTool]);

  const selectionOnDrag = useMemo(() => {
    return currentTool === 'select' ? true : false;
  }, [currentTool]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header 
        projectName="StartTech" 
        diagramName={diagramName}
        onDiagramNameChange={setDiagramName}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar 
          isMinimized={isSidebarMinimized}
          onToggle={() => setIsSidebarMinimized(!isSidebarMinimized)}
        />
        
        {/* Diagram Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="p-4">
            <Toolbar />
          </div>
          
          {/* ReactFlow */}
          <div 
            className="flex-1 relative"
            onMouseDown={handlePaneMouseDown}
            onMouseUp={handlePaneMouseUp}
            onMouseLeave={handleMouseLeave}
          >
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
              snapToGrid={false}
              snapGrid={[1, 1]}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: false,
                style: { 
                  stroke: '#2196f3', 
                  strokeWidth: 2,
                  strokeDasharray: '8,4'
                }
              }}
              connectionRadius={80}
              connectOnClick={true}
              connectionLineType={ConnectionLineType.SmoothStep}
              connectionLineStyle={{ 
                stroke: '#2196f3', 
                strokeWidth: 3, 
                strokeDasharray: '8,4',
                strokeOpacity: 0.8
              }}
              elevateNodesOnSelect={true}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              isValidConnection={(connection) => {
                return (
                  connection.source &&
                  connection.target &&
                  connection.source !== connection.target
                );
              }}
              panOnDrag={panOnDrag}
              selectionOnDrag={selectionOnDrag}
              selectionMode={SelectionMode.Partial}
              multiSelectionKeyCode="Shift"
              deleteKeyCode="Delete"
              proOptions={proOptions}
              className={
                currentTool === 'add-table' 
                  ? 'cursor-crosshair' 
                  : isDraggingWithMiddleMouse 
                    ? 'cursor-grabbing'
                    : 'cursor-default'
              }
            >
              <Background color="#E5E7EB" size={2} />
              
              <Controls 
                position="bottom-left"
                showZoom={true}
                showFitView={true}
                showInteractive={false}
              />
              
              <MiniMap 
                position="bottom-right"
                pannable={true}
                zoomable={true}
                nodeColor={(node) => {
                  switch (node.data?.type) {
                    case 'person': return '#10B981';
                    case 'system': return '#3B82F6';
                    case 'container': return '#8B5CF6';
                    case 'component': return '#F59E0B';
                    default: return '#6B7280';
                  }
                }}
                style={{
                  backgroundColor: 'white',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              
              <Panel position="top-right">
                <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-600">
                    {currentTool === 'add-table' ? (
                      <span className="text-blue-600 font-medium">
                        📊 Clique para criar tabela
                      </span>
                    ) : (
                      <span>🖱️ Modo seleção</span>
                    )}
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  return (
    <ReactFlowProvider>
      <DiagramFlow 
        isSidebarMinimized={isSidebarMinimized}
        setIsSidebarMinimized={setIsSidebarMinimized}
      />
    </ReactFlowProvider>
  );
}

export default App;
