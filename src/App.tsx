import React, { useCallback, useMemo, useState } from 'react';
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

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  const panOnDrag = useMemo(() => {
    return currentTool === 'select' ? [1, 2] : false;
  }, [currentTool]);

  const selectionOnDrag = useMemo(() => {
    return currentTool === 'select';
  }, [currentTool]);

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
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#2196f3', strokeWidth: 3 },
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
                ? 'cursor-crosshair' 
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
            
            <Panel position="top-center">
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
