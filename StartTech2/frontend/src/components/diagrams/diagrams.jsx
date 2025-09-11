import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  ConnectionMode,
  ConnectionLineType,
  SelectionMode,
  ReactFlowProvider
} from '@xyflow/react';

import useDiagramStore from '../../stores/diagramStore.js';
import { useDiagramIntegration } from '../../stores/useDiagramIntegration.js';
import { useDiagramManager } from '../../stores/diagramManager.js';
import { C4NodeComponent } from './C4Node.jsx';
import OffsetEdge from './OffsetEdge.jsx';
import { Sidebar } from './SidebarSimple.jsx';
import './index.css';
import './diagrams.css';

const nodeTypes = {
  c4Node: C4NodeComponent,
};

const edgeTypes = {
  offset: OffsetEdge,
};

function DiagramFlow({ isSidebarMinimized, setIsSidebarMinimized }) {
  const [isDraggingWithMiddleMouse, setIsDraggingWithMiddleMouse] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableCreationStart, setTableCreationStart] = useState(null);
  const [tableCreationEnd, setTableCreationEnd] = useState(null);
  
  // Hooks
  const navigate = useNavigate();
  
  // Integração entre stores
  useDiagramIntegration();
  
  const { getCurrentDiagram, updateDiagramName } = useDiagramManager();
  
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
    setDiagramName,
    exportDiagram,
  } = useDiagramStore();

  // Sincronizar nome do diagrama atual
  const currentDiagram = getCurrentDiagram();
  const actualDiagramName = currentDiagram?.name || diagramName;

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

  const handleConnect = useCallback(
    (connection) => {
      console.log('🔗 Tentando conectar:', connection);
      
      if (!connection.source || !connection.target) {
        console.warn('❌ Conexão inválida - source ou target ausente');
        return;
      }
      
      if (connection.source === connection.target) {
        console.warn('❌ Conexão inválida - não é possível conectar nó a si mesmo');
        return;
      }
      
      onConnect(connection);
    },
    [onConnect]
  );

  // Função para detectar clique no canvas
  const handlePaneClick = useCallback((event) => {
    if (currentTool === 'add-table') {
      const rect = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      
      addNodeWithSize(position, { width: 200, height: 100 });
      setCurrentTool('select');
    }
  }, [currentTool, addNodeWithSize, setCurrentTool]);

  // Função para lidar com seleção
  const handleSelectionChange = useCallback((params) => {
    const selectedNodeIds = params.nodes.map(node => node.id);
    const selectedEdgeIds = params.edges.map(edge => edge.id);
    setSelectedElements([...selectedNodeIds, ...selectedEdgeIds]);
  }, [setSelectedElements]);

  // Cursor personalizado baseado na ferramenta atual
  const paneCursor = useMemo(() => {
    switch (currentTool) {
      case 'add-table': return 'crosshair';
      default: return 'default';
    }
  }, [currentTool]);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isMinimized={isSidebarMinimized}
        onToggle={() => setIsSidebarMinimized(!isSidebarMinimized)}
      />
      
      {/* Área principal do diagrama */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onPaneClick={handlePaneClick}
          onSelectionChange={handleSelectionChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          connectionLineType={ConnectionLineType.Straight}
          selectionMode={SelectionMode.Partial}
          fitViewOptions={{ maxZoom: 0.8, minZoom: 0.5 }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          className="react-flow-diagram"
          style={{ cursor: paneCursor }}
          connectOnClick={false}
          isValidConnection={(connection) => {
            // Permite conexões entre qualquer handle
            return connection.source !== connection.target;
          }}
          defaultEdgeOptions={{
            type: 'offset',
            style: { 
              strokeDasharray: '8,4',
              strokeWidth: 2,
              stroke: '#64748b'
            },
            markerEnd: {
              type: 'arrowclosed',
              color: '#64748b',
              width: 12,
              height: 12
            }
          }}
          connectionLineStyle={{
            strokeDasharray: '8,4',
            strokeWidth: 2,
            stroke: '#64748b'
          }}
        >
          <Background 
            variant="dots" 
            gap={20} 
            size={1}
            color="#94a3b8"
          />
          <Controls 
            position="bottom-left"
            showInteractive={false}
          />
          <MiniMap 
            position="bottom-right"
            nodeColor="#e2e8f0"
            maskColor="rgba(0, 0, 0, 0.1)"
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          />
          
          {/* Painel de título e ferramentas - linha horizontal no topo */}
          <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-3 border">
            <div className="flex items-center gap-6">
              {/* Título do diagrama */}
              <div className="flex items-center">
                <input
                  type="text"
                  value={actualDiagramName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setDiagramName(newName);
                    // Atualizar o nome no diagrama atual também
                    if (currentDiagram) {
                      updateDiagramName(currentDiagram.id, newName);
                    }
                  }}
                  className="text-lg font-semibold bg-transparent border-none outline-none min-w-[200px]"
                  placeholder="Nome do Diagrama"
                />
              </div>
              
              {/* Ferramentas */}
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentTool('select')}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    currentTool === 'select'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Selecionar
                </button>
                <button
                  onClick={() => setCurrentTool('add-table')}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    currentTool === 'add-table'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Adicionar Tabela
                </button>
                <button
                  onClick={() => exportDiagram()}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-green-500 text-white hover:bg-green-600"
                  title="Exportar diagrama como JSON"
                >
                  Exportar JSON
                </button>
                <button
                  onClick={() => navigate('/access-manager')}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-purple-500 text-white hover:bg-purple-600"
                  title="Gerenciar acessos do sistema"
                >
                  Gerenciar Acessos
                </button>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

// Componente principal com Provider
function DiagramEditor() {
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

export default DiagramEditor;
