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
  
  // Estados para criação de tabela por drag
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [tableCreationStart, setTableCreationStart] = useState(null);
  const [tableCreationEnd, setTableCreationEnd] = useState(null);
  
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
    setDiagramName,
  } = useDiagramStore();

  // Função integrada para atualizar nome do diagrama
  const handleDiagramNameChange = useCallback((name) => {
    setDiagramName(name);
    if (currentDiagramId) {
      updateDiagramName(currentDiagramId, name);
    }
  }, [setDiagramName, currentDiagramId, updateDiagramName]);

  const handleNodesChange = useCallback(
    (changes) => {
      // Aplicar mudanças diretamente - React Flow já otimiza internamente
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
      console.log('🔗 Tentando conectar:', {
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle
      });
      
      // Validação adicional
      if (!connection.source || !connection.target) {
        console.warn('❌ Conexão inválida - source ou target ausente');
        return;
      }
      
      if (connection.source === connection.target) {
        console.warn('❌ Conexão inválida - não é possível conectar nó a si mesmo');
        return;
      }
      
      console.log('✅ Conexão válida, enviando para store');
      onConnect(connection);
    },
    [onConnect]
  );

  const handlePaneClick = useCallback(
    (event) => {
      // Verificar se é clique simples e está no modo add-table
      if (currentTool === 'add-table' && !isCreatingTable && reactFlowInstance) {
        console.log('🔧 Criando nó por clique...');
        
        try {
          // Usar screenToFlowPosition diretamente - método recomendado pelo ReactFlow
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          
          console.log('📍 Posição calculada:', position);
          
          // Verificar se não há nó muito próximo (evitar duplicação acidental)
          const tooClose = nodes.some(node => {
            const distance = Math.sqrt(
              Math.pow(node.position.x - position.x, 2) + 
              Math.pow(node.position.y - position.y, 2)
            );
            return distance < 50; // Distância mínima de 50px
          });
          
          if (tooClose) {
            console.log('⚠️ Nó muito próximo, criação cancelada');
            return;
          }
          
          // Centralizar a tabela no ponto de clique
          const finalPosition = {
            x: position.x - 90, // Metade da largura padrão (180/2)
            y: position.y - 60, // Metade da altura padrão (120/2)
          };
          
          // Criar o nó
          addNodeWithSize(finalPosition, { width: 180, height: 120 });
          
          console.log('✅ Nó criado com sucesso');
          
          // Voltar automaticamente para o modo selecionar
          setCurrentTool('select');
        } catch (error) {
          console.error('❌ Erro ao criar nó:', error);
        }
      }
    },
    [currentTool, addNodeWithSize, setCurrentTool, reactFlowInstance, isCreatingTable, nodes]
  );

  // Handlers para criação de tabela por drag
  const handlePaneMouseDown = useCallback(
    (event) => {
      // Botão do meio para pan (cursor hand)
      if (event.button === 1) {
        setIsDraggingWithMiddleMouse(true);
      }
  // Handlers para mouse events
  const handlePaneMouseDown = useCallback(
    (event) => {
      // Botão do meio para pan (cursor hand)
      if (event.button === 1) {
        setIsDraggingWithMiddleMouse(true);
      }
      
      // Criação por drag temporariamente desabilitada para evitar conflitos
      // Usar apenas clique simples no modo add-table
    },
    []
  );

  const handlePaneMouseMove = useCallback(
    (event) => {
      // Mouse move events (se necessário)
    },
    []
  );
        
        setTableCreationEnd(position);
      }
    },
    [isCreatingTable, tableCreationStart, reactFlowInstance]
  );

  const handlePaneMouseUp = useCallback(
    (event) => {
      // Finalizar drag com botão do meio
      if (event.button === 1) {
        setIsDraggingWithMiddleMouse(false);
      }
      
      // Finalizar criação de tabela por drag
      if (event.button === 0 && isCreatingTable && tableCreationStart && tableCreationEnd) {
        const width = Math.abs(tableCreationEnd.x - tableCreationStart.x);
        const height = Math.abs(tableCreationEnd.y - tableCreationStart.y);
        
        // Sempre usar o tamanho mínimo se o drag foi pequeno
        const finalWidth = Math.max(width, 180);
        const finalHeight = Math.max(height, 120);
        
        const position = {
          x: Math.min(tableCreationStart.x, tableCreationEnd.x),
          y: Math.min(tableCreationStart.y, tableCreationEnd.y),
        };
        
        addNodeWithSize(position, { width: finalWidth, height: finalHeight });
        
        // Reset dos estados
        setIsCreatingTable(false);
        setTableCreationStart(null);
        setTableCreationEnd(null);
        setCurrentTool('select');
      }
    },
    [isCreatingTable, tableCreationStart, tableCreationEnd, addNodeWithSize, setCurrentTool]
  );

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }) => {
      setSelectedElements(selectedNodes.map(node => node.id));
    },
    [setSelectedElements]
  );

  // Handlers para controle do cursor durante drag com botão do meio
  const handleMouseDown = useCallback((event) => {
    if (event.button === 1) { // Botão do meio
      setIsDraggingWithMiddleMouse(true);
    }
  }, []);

  const handleMouseUp = useCallback((event) => {
    if (event.button === 1) { // Botão do meio
      setIsDraggingWithMiddleMouse(false);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDraggingWithMiddleMouse(false);
  }, []);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

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

    // Converter coordenadas de flow para coordenadas de tela
    const startScreenPos = reactFlowInstance.flowToScreenPosition({
      x: Math.min(tableCreationStart.x, tableCreationEnd.x),
      y: Math.min(tableCreationStart.y, tableCreationEnd.y)
    });
    
    const endScreenPos = reactFlowInstance.flowToScreenPosition({
      x: Math.max(tableCreationStart.x, tableCreationEnd.x),
      y: Math.max(tableCreationStart.y, tableCreationEnd.y)
    });

    const width = Math.abs(endScreenPos.x - startScreenPos.x);
    const height = Math.abs(endScreenPos.y - startScreenPos.y);

    return {
      left: startScreenPos.x,
      top: startScreenPos.y,
      width: width, // Tamanho real do drag, sem mínimo
      height: height, // Tamanho real do drag, sem mínimo
      display: 'block',
      position: 'fixed' // Posição fixa na tela
    };
  }, [isCreatingTable, tableCreationStart, tableCreationEnd, reactFlowInstance]);

  return (
    <div className="w-full h-screen flex">
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
          onDiagramNameChange={handleDiagramNameChange}
        />
        
        {/* Diagram Area */}
        <div className="flex-1 relative w-full h-full">
          <div
            onMouseDown={(e) => {
              handleMouseDown(e);
              handlePaneMouseDown(e);
            }}
            onMouseUp={(e) => {
              handleMouseUp(e);
              handlePaneMouseUp(e);
            }}
            onMouseMove={handlePaneMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-full relative"
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
                // Validação simplificada para melhor performance
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
              connectionLineComponent={undefined} // Preview da conexão ativado
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
