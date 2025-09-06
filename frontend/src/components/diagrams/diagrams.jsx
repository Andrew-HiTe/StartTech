import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow
} from '@xyflow/react';

import { Sidebar } from './SidebarSimple.jsx';
import './index.css';
import './diagrams.css';

// Componente de nó customizado
const C4NodeComponent = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.title || 'Novo Componente');
  const [description, setDescription] = useState(data.description || 'Descrição');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      data.title = title;
      data.description = description;
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.title = title;
    data.description = description;
  };

  return (
    <div 
      className={`px-4 py-3 shadow-lg rounded-lg border-2 bg-white min-w-[200px] ${
        selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            className="font-bold text-sm border rounded px-1 w-full"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            className="text-xs text-gray-600 border rounded px-1 w-full"
            rows="2"
          />
        </div>
      ) : (
        <div>
          <div className="font-bold text-sm text-gray-800">{title}</div>
          <div className="text-xs text-gray-600 mt-1">{description}</div>
        </div>
      )}
      
      {/* Handles de conexão */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
    </div>
  );
};

// Componente Toolbar simplificado
const Toolbar = () => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex gap-2">
      <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
        Selecionar
      </button>
      <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
        Adicionar
      </button>
      <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
        Excluir
      </button>
    </div>
  );
};

const nodeTypes = {
  c4Node: C4NodeComponent,
};

function DiagramFlow({ isSidebarMinimized, setIsSidebarMinimized }) {
  // Estados sem tipagem TypeScript
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [currentTool, setCurrentTool] = useState('select');
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableCreationStart, setTableCreationStart] = useState(null);
  const [tableCreationEnd, setTableCreationEnd] = useState(null);
  const [isDraggingWithMiddleMouse, setIsDraggingWithMiddleMouse] = useState(false);
  
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);

  // Função para conectar nós
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  // Handlers de mouse
  const handleMouseDown = useCallback((event) => {
    if (event.button === 1) {
      setIsDraggingWithMiddleMouse(true);
    }
  }, []);

  const handleMouseUp = useCallback((event) => {
    if (event.button === 1) {
      setIsDraggingWithMiddleMouse(false);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDraggingWithMiddleMouse(false);
  }, []);

  // Função para adicionar nó
  const addNode = useCallback((position) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'c4Node',
      position: position || { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        title: `Componente ${nodes.length + 1}`,
        description: 'Nova descrição',
        type: 'component'
      }
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, setNodes]);

  // Função para clique no canvas
  const handlePaneClick = useCallback((event) => {
    if (currentTool === 'add-table' && reactFlowInstance) {
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(position);
    }
  }, [currentTool, reactFlowInstance, addNode]);

  // Controle de pan/drag
  const panOnDrag = useMemo(() => {
    return currentTool === 'select' && !isCreatingTable ? [1, 2] : false;
  }, [currentTool, isCreatingTable]);

  const selectionOnDrag = useMemo(() => {
    return currentTool === 'select';
  }, [currentTool]);

  // Função para calcular o preview da criação de tabela
  const getTableCreationPreviewStyle = useCallback(() => {
    if (!isCreatingTable || !tableCreationStart || !tableCreationEnd) {
      return { display: 'none' };
    }

    const startX = Math.min(tableCreationStart.x, tableCreationEnd.x);
    const startY = Math.min(tableCreationStart.y, tableCreationEnd.y);
    const width = Math.abs(tableCreationEnd.x - tableCreationStart.x);
    const height = Math.abs(tableCreationEnd.y - tableCreationStart.y);

    return {
      position: 'absolute',
      left: startX,
      top: startY,
      width: Math.max(width, 100),
      height: Math.max(height, 60),
      border: '2px dashed #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '8px',
      pointerEvents: 'none',
      zIndex: 1000,
    };
  }, [isCreatingTable, tableCreationStart, tableCreationEnd]);

  // Event listeners para mouse
  useEffect(() => {
    const wrapper = reactFlowWrapper.current;
    if (!wrapper) return;

    wrapper.addEventListener('mousedown', handleMouseDown);
    wrapper.addEventListener('mouseup', handleMouseUp);
    wrapper.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      wrapper.removeEventListener('mousedown', handleMouseDown);
      wrapper.removeEventListener('mouseup', handleMouseUp);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseLeave]);

  // Manipuladores de mudanças
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  const handleConnect = useCallback((connection) => {
    console.log('🔗 Tentando conectar:', {
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle
    });
    
    onConnect(connection);
  }, [onConnect]);

  return (
    <div className="flex h-screen">
      <Sidebar 
        isMinimized={isSidebarMinimized} 
        onToggle={() => setIsSidebarMinimized(!isSidebarMinimized)} 
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 p-4 border-b">
          <h1 className="text-xl font-semibold">Editor de Diagramas C4</h1>
        </div>

        {/* Toolbar Superior */}
        <div className="bg-white border-b p-2 flex gap-2">
          <button
            onClick={() => setCurrentTool('select')}
            className={`px-3 py-1 rounded transition-colors ${
              currentTool === 'select' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Selecionar
          </button>
          <button
            onClick={() => setCurrentTool('add-table')}
            className={`px-3 py-1 rounded transition-colors ${
              currentTool === 'add-table' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Adicionar Componente
          </button>
          <button
            onClick={() => addNode()}
            className="px-3 py-1 rounded bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            Adicionar Nó Rápido
          </button>
        </div>

        {/* Canvas Principal */}
        <div ref={reactFlowWrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
            snapToGrid
            snapGrid={[15, 15]}
            panOnDrag={panOnDrag}
            selectionOnDrag={selectionOnDrag}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#2196f3', strokeWidth: 3 },
            }}
            className={
              currentTool === 'add-table' 
                ? 'cursor-add-table' 
                : isDraggingWithMiddleMouse 
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
                  case 'container': return '#8b5cf6';
                  case 'component': return '#f59e0b';
                  default: return '#6b7280';
                }
              }}
              className="bg-white border border-gray-300 rounded-lg"
            />
            
            <Panel position="bottom-center">
              <Toolbar />
            </Panel>

            <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg border">
              <div className="text-sm space-y-2">
                <h3 className="font-semibold text-gray-800 mb-2">Como Usar:</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div><strong>Mover:</strong> Arraste a tabela</div>
                  <div><strong>Conectar:</strong> Arraste pelos pontos azuis nas bordas</div>
                  <div><strong>Editar:</strong> Duplo clique no texto</div>
                  <div><strong>Adicionar:</strong> Clique no canvas (modo adicionar)</div>
                  <div><strong>Excluir:</strong> Selecione + botão excluir</div>
                </div>
                <div className="text-xs mt-2 pt-2 border-t">
                  <div>{nodes.length} tabela(s) • {edges.length} conexão(ões)</div>
                </div>
              </div>
            </Panel>
          </ReactFlow>
          
          {/* Preview da criação de tabela */}
          {isCreatingTable && (
            <div 
              className="table-creation-preview"
              style={getTableCreationPreviewStyle()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DiagramFlow;