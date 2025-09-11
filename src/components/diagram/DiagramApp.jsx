/**
 * Aplicação de Diagramas - Página principal do editor
 * Contém o ReactFlow, toolbar, sidebar e funcionalidades de edição
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  Panel,
  SelectionMode,
  useReactFlow,
  ConnectionLineType,
} from '@xyflow/react';

import { useDiagramStore } from '../../stores/diagramStore.js';
import { useDiagramIntegration } from '../../stores/useDiagramIntegration.js';
import { useDiagramManager } from '../../stores/diagramManager.js';
import { C4NodeComponent } from '../../components/C4Node.jsx';
import { Toolbar } from '../../components/Toolbar.jsx';
import { Sidebar } from '../../components/SidebarSimple.jsx';
import { Header } from '../../components/Header.jsx';
import { ToastContainer } from '../../components/Toast.jsx';
import { useToast } from '../../hooks/useToast.js';

const nodeTypes = {
  c4Node: C4NodeComponent,
};

function DiagramFlow({ isSidebarMinimized, setIsSidebarMinimized }) {
  const reactFlowInstance = useReactFlow();
  const [isDraggingWithMiddleMouse, setIsDraggingWithMiddleMouse] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState(null);
  const [previewNode, setPreviewNode] = useState(null);
  
  // Sistema de notificações
  const { toasts, removeToast, showSuccess, showWarning, showError, showInfo } = useToast();
  
  console.log('🚀 DiagramFlow renderizado, componente carregado');
  
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

  // Debug: mostrar currentTool
  console.log('🔧 Current tool:', currentTool);

  // Função integrada para atualizar nome do diagrama
  const handleDiagramNameChange = useCallback((name) => {
    setDiagramName(name);
    if (currentDiagramId) {
      updateDiagramName(currentDiagramId, name);
    }
  }, [setDiagramName, currentDiagramId, updateDiagramName]);

  const proOptions = { hideAttribution: true };

  // Handler para start de conexão
  const handleConnectStart = useCallback(
    (event, { nodeId, handleId, handleType }) => {
      console.log('🔗 handleConnectStart:', { nodeId, handleId, handleType });
    },
    []
  );

  // Handler para end de conexão
  const handleConnectEnd = useCallback(
    (event) => {
      console.log('🔗 handleConnectEnd:', event);
    },
    []
  );
  const handleConnect = useCallback(
    (connection) => {
      console.log('🔗 handleConnect chamado:', connection);
      
      // Verificar se existe conexão anterior entre esses nós
      const { source, target } = connection;
      const existingConnections = edges.filter(edge => 
        (edge.source === source && edge.target === target) ||
        (edge.source === target && edge.target === source)
      );
      
      // Chamar a função do store que já faz a substituição
      onConnect(connection);
      
      // Mostrar notificação apropriada
      if (existingConnections.length > 0) {
        showInfo(`Conexão substituída entre os nós`, 2500);
      } else {
        showSuccess('Nova conexão criada!', 2000);
      }
    },
    [onConnect, edges, showInfo, showSuccess]
  );

  // Handler para cliques em nós
  const handleNodeClick = useCallback(
    (event, node) => {
      console.log('🎯 handleNodeClick chamado:', node.id, { event, currentTool });
      
      // Se estiver no modo select, permitir seleção normal
      if (currentTool === 'select') {
        console.log('✅ Modo select ativo, permitindo seleção do nó');
      }
      
      // Não usar stopPropagation para permitir seleção automática do ReactFlow
    },
    [currentTool]
  );

  // Handler para drag de nós
  const handleNodeDrag = useCallback(
    (event, node) => {
      console.log('🚀 handleNodeDrag:', node.id);
    },
    []
  );

  // Handler para double click em nós
  const handleNodeDoubleClick = useCallback(
    (event, node) => {
      console.log('🎯 handleNodeDoubleClick:', node.id);
      // Permitir que o comportamento padrão de edição funcione
    },
    []
  );
  const handlePaneClick = useCallback(
    (event) => {
      console.log('🖱️ Pane CLICK!', { 
        currentTool, 
        isDragging,
        hadDragSession: !!dragStartPos 
      });
      
      // Se acabou de terminar um drag, não processar como clique
      if (isDragging || dragStartPos) {
        console.log('🚫 Ignorando click - estava em drag session');
        return;
      }
      
      // Só processar cliques simples quando não há drag ativo
      if (currentTool === 'add-table') {
        console.log('🔧 Modo add-table ativo, criando nó via clique...');
        
        if (!reactFlowInstance) {
          console.error('❌ ReactFlow instance não disponível');
          return;
        }

        try {
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          
          console.log('📍 Posição do clique:', position);
          
          // Verificar proximidade
          const tooClose = nodes.some(node => {
            if (node.id.startsWith('preview-')) return false;
            const distance = Math.sqrt(
              Math.pow(node.position.x - position.x, 2) + 
              Math.pow(node.position.y - position.y, 2)
            );
            return distance < 80;
          });
          
          if (tooClose) {
            console.log('⚠️ Clique muito próximo de nó existente');
            return;
          }
          
          const finalPosition = {
            x: position.x - 90,
            y: position.y - 60,
          };
          
          console.log('🎯 Criando nó via clique em:', finalPosition);
          const createdNode = addNodeWithSize(finalPosition, { width: 180, height: 120 });
          
          if (createdNode) {
            console.log('✅ Nó criado com sucesso');
            showSuccess('Nó criado com sucesso!', 2000);
            // Voltar para modo seleção
            setCurrentTool('select');
          } else {
            console.log('❌ Falha ao criar nó - verificar validações');
            showWarning('Não foi possível criar o nó nesta posição. Tente em outro local.');
          }
          
        } catch (error) {
          console.error('❌ Erro ao criar nó via clique:', error);
        }
      }
    },
    [currentTool, addNodeWithSize, setCurrentTool, reactFlowInstance, nodes, isDragging, dragStartPos]
  );

  // Handlers para drag de criação de nós - VERSÃO SIMPLIFICADA
  const handlePaneMouseDown = useCallback(
    (event) => {
      console.log('🖱️ PANE MouseDown:', { 
        button: event.button, 
        currentTool, 
        isDragging,
        eventType: 'pane'
      });

      // Só processar botão esquerdo no modo add-table
      if (currentTool === 'add-table' && event.button === 0) {
        console.log('✅ Iniciando processo de drag/criação');
        
        if (!reactFlowInstance) {
          console.error('❌ ReactFlow instance não disponível');
          return;
        }

        try {
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });

          console.log('📍 Posição calculada:', position);

          // Inicializar o drag
          setIsDragging(true);
          setDragStartPos(position);
          
          // Criar preview imediatamente
          const previewPosition = {
            x: position.x - 90,
            y: position.y - 60,
          };
          
          const newPreviewNode = {
            id: 'preview-node-' + Date.now(),
            type: 'c4Node',
            position: previewPosition,
            data: {
              name: 'Nova Tabela',
              description: 'Arraste para posicionar',
              type: 'table',
              isPreview: true
            },
            style: {
              opacity: 0.7,
              pointerEvents: 'none',
              border: '2px dashed #3B82F6'
            }
          };
          
          setPreviewNode(newPreviewNode);
          console.log('👻 Preview node criado:', newPreviewNode.id);

        } catch (error) {
          console.error('❌ Erro ao iniciar drag:', error);
        }
      }
    },
    [currentTool, reactFlowInstance, isDragging]
  );

  const handlePaneMouseMove = useCallback(
    (event) => {
      if (isDragging && dragStartPos && reactFlowInstance && previewNode) {
        // console.log('🖱️ MouseMove durante drag'); // Comentado para evitar spam
        
        try {
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });

          const previewPosition = {
            x: position.x - 90,
            y: position.y - 60,
          };

          setPreviewNode(prev => prev ? {
            ...prev,
            position: previewPosition
          } : null);
        } catch (error) {
          console.error('❌ Erro no mouse move:', error);
        }
      }
    },
    [isDragging, dragStartPos, reactFlowInstance, previewNode]
  );

  const handlePaneMouseUp = useCallback(
    (event) => {
      console.log('🖱️ PANE MouseUp:', { 
        button: event.button, 
        isDragging, 
        currentTool,
        dragStartPos: !!dragStartPos
      });

      if (isDragging && dragStartPos && currentTool === 'add-table') {
        console.log('🎯 Finalizando criação de nó');
        
        if (!reactFlowInstance) {
          console.error('❌ ReactFlow instance não disponível no mouseUp');
          return;
        }

        try {
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });

          // Calcular distância do drag
          const distance = Math.sqrt(
            Math.pow(position.x - dragStartPos.x, 2) + 
            Math.pow(position.y - dragStartPos.y, 2)
          );

          console.log('📏 Distância do drag:', distance);

          // Verificar se há nós muito próximos
          const tooClose = nodes.some(node => {
            if (node.id.startsWith('preview-')) return false; // Ignorar previews
            const nodeDistance = Math.sqrt(
              Math.pow(node.position.x - position.x, 2) + 
              Math.pow(node.position.y - position.y, 2)
            );
            return nodeDistance < 80;
          });

          if (!tooClose) {
            const finalPosition = {
              x: position.x - 90,
              y: position.y - 60,
            };

            console.log('✅ Criando nó final em:', finalPosition);
            const createdNode = addNodeWithSize(finalPosition, { width: 180, height: 120 });
            
            if (createdNode) {
              console.log('✅ Nó criado com sucesso via drag');
              showSuccess('Nó criado com sucesso!', 2000);
              // Voltar para modo seleção
              setCurrentTool('select');
              console.log('🔄 Voltando para modo select');
            } else {
              console.log('❌ Falha ao criar nó via drag - verificar validações');
              showWarning('Não foi possível criar o nó nesta posição. Tente em outro local.');
            }
          } else {
            console.log('⚠️ Posição muito próxima de outro nó');
          }

        } catch (error) {
          console.error('❌ Erro ao finalizar criação:', error);
        }

        // SEMPRE limpar o estado de drag
        console.log('🧹 Limpando estado de drag');
        setIsDragging(false);
        setDragStartPos(null);
        setPreviewNode(null);
      }
    },
    [isDragging, dragStartPos, currentTool, reactFlowInstance, nodes, addNodeWithSize, setCurrentTool]
  );

  // Handlers básicos de mouse (mantidos para compatibilidade)
  const handleMouseLeave = useCallback(() => {
    setIsDraggingWithMiddleMouse(false);
    // Limpar drag se sair da área
    if (isDragging) {
      console.log('🚪 Mouse saiu da área, limpando drag');
      setIsDragging(false);
      setDragStartPos(null);
      setPreviewNode(null);
    }
  }, [isDragging]);

  const handleNodesChange = useCallback(
    (changes) => {
      console.log('🔄 handleNodesChange:', changes);
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
      console.log('🎯 Seleção mudou:', { 
        nodes: selectedNodes.map(n => n.id), 
        edges: selectedEdges.map(e => e.id) 
      });
      
      const selectedElementIds = [
        ...selectedNodes.map(node => node.id),
        ...selectedEdges.map(edge => edge.id)
      ];
      setSelectedElements(selectedElementIds);
      
      // Log adicional para cada nó selecionado
      selectedNodes.forEach(node => {
        console.log(`🎯 Nó ${node.id} selecionado`);
      });
    },
    [setSelectedElements]
  );

  // Configurações de pan e drag
  const panOnDrag = useMemo(() => {
    // Sempre permitir pan com clique do meio (botão 1) 
    // Desabilitar pan com botão esquerdo apenas quando criando nós
    if (currentTool === 'add-table') {
      return [1]; // Só botão do meio
    }
    return [1, 2]; // Botão do meio e direito
  }, [currentTool]);

  const selectionOnDrag = useMemo(() => {
    // Sempre permitir seleção no modo select
    return currentTool === 'select';
  }, [currentTool]);

  // Combinar nós com preview
  const allNodes = useMemo(() => {
    return previewNode ? [...nodes, previewNode] : nodes;
  }, [nodes, previewNode]);

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
          <ReactFlow
              nodes={allNodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              onConnectStart={handleConnectStart}
              onConnectEnd={handleConnectEnd}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onNodeDrag={handleNodeDrag}
              onPaneClick={handlePaneClick}
              onPaneMouseDown={handlePaneMouseDown}
              onPaneMouseMove={handlePaneMouseMove}
              onPaneMouseUp={handlePaneMouseUp}
              onPaneMouseLeave={handleMouseLeave}
              onSelectionChange={handleSelectionChange}
              connectionMode={ConnectionMode.Loose}
              defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
              snapToGrid={false}
              snapGrid={[1, 1]}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#2196f3', strokeWidth: 3 },
              }}
              connectionRadius={30}
              connectOnClick={false}
              connectionLineType={ConnectionLineType.SmoothStep}
              connectionLineStyle={{ stroke: '#2196f3', strokeWidth: 3, strokeDasharray: '5,5' }}
              elevateNodesOnSelect={true}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              connectionLineComponent={undefined} // Preview da conexão ativado
              selectNodesOnDrag={false}
              nodesFocusable={true}
              edgesFocusable={true}
              minZoom={0.1}
              maxZoom={4}
              isValidConnection={(connection) => {
                // Validar conexão antes de permitir
                if (!connection.source || !connection.target) return false;
                if (connection.source === connection.target) return false;
                return true;
              }}
              panOnDrag={panOnDrag}
              selectionOnDrag={selectionOnDrag}
              selectionMode={SelectionMode.Partial}
              multiSelectionKeyCode="Shift"
              deleteKeyCode="Delete"
              proOptions={proOptions}
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
        </div>
      </div>
      
      {/* Sistema de Notificações */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function DiagramApp() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  return (
    <DiagramFlow 
      isSidebarMinimized={isSidebarMinimized}
      setIsSidebarMinimized={setIsSidebarMinimized}
    />
  );
}

export default DiagramApp;
