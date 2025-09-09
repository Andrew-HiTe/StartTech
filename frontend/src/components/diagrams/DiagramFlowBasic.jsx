import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { C4NodeComponent } from './C4Node.jsx';
import OffsetEdge from './OffsetEdge';
import { Sidebar } from './SidebarSimple.jsx';
import './index.css';
import './diagrams.css';

const nodeTypes = {
  c4Node: C4NodeComponent,
  default: C4NodeComponent,
};

const edgeTypes = {
  default: OffsetEdge,
  straight: OffsetEdge,
  smoothstep: OffsetEdge,
};

// Versão simplificada para debug
const DiagramFlowBasic = () => {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [diagramName, setDiagramName] = useState('Meu Diagrama');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [currentDiagramId, setCurrentDiagramId] = useState(null);

  // Função para carregar um diagrama específico
  const loadDiagramById = async (diagramId) => {
    try {
      console.log(`🔧 Carregando diagrama: ${diagramId}`);
      const response = await fetch(`http://localhost:5000/api/diagrams/${diagramId}/full`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.diagram) {
          setNodes(data.diagram.nodes || []);
          setEdges(data.diagram.edges || []);
          setDiagramName(data.diagram.name || 'Diagrama sem nome');
          setCurrentDiagramId(diagramId);
          console.log(`✅ Diagrama carregado: ${data.diagram.name}`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao carregar diagrama:', error);
      return false;
    }
  };

  // Listener para mudanças no sessionStorage (seleção de diagrama)
  useEffect(() => {
    const checkForDiagramChange = () => {
      const storedId = sessionStorage.getItem('activeDiagramId');
      if (storedId && storedId !== currentDiagramId) {
        console.log(`🔄 Detectada mudança de diagrama: ${storedId}`);
        loadDiagramById(storedId);
      }
    };

    // Carregar diagrama inicial
    const initialId = sessionStorage.getItem('activeDiagramId');
    if (initialId && !currentDiagramId) {
      loadDiagramById(initialId);
    }

    // Verificar mudanças periódicas
    const interval = setInterval(checkForDiagramChange, 1000);

    return () => clearInterval(interval);
  }, [currentDiagramId]);

  // Função para salvar mudanças no diagrama
  const saveToDatabase = async (nodesToSave, edgesToSave) => {
    let diagramId = currentDiagramId;

    // Se não há diagrama ativo, criar um novo
    if (!diagramId) {
      try {
        diagramId = `diagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const createResponse = await fetch('http://localhost:5000/api/diagrams/create-table', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diagramId: diagramId,
            diagramName: diagramName,
            timestamp: Date.now()
          })
        });

        if (createResponse.ok) {
          setCurrentDiagramId(diagramId);
          sessionStorage.setItem('activeDiagramId', diagramId);
          console.log(`🆕 Novo diagrama criado: ${diagramId}`);
        } else {
          console.error('❌ Falha ao criar diagrama');
          return;
        }
      } catch (error) {
        console.error('❌ Erro ao criar diagrama:', error);
        return;
      }
    }

    try {
      // Salvar cada nó/tabela no banco
      for (const node of nodesToSave) {
        if (node.type === 'c4Node' && node.data?.tableName) {
          const nodeData = {
            diagramId: diagramId,
            nodeId: node.id,
            nodeName: node.data.tableName,
            nodeType: 'table',
            nodeDescription: node.data.description || '',
            fields: node.data.fields || [],
            position: node.position,
            style: {
              width: node.style?.width || 200,
              height: node.style?.height || 150
            }
          };

          await fetch('http://localhost:5000/api/diagrams/add-table-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nodeData)
          });
        }
      }

      console.log(`💾 Salvamento automático realizado para ${nodesToSave.length} nós`);
    } catch (error) {
      console.error('❌ Erro ao salvar no banco:', error);
    }
  };

  // Auto-save quando os nós mudarem
  useEffect(() => {
    if (nodes.length > 0 && currentDiagramId) {
      // Debounce - salvar apenas após 2 segundos sem mudanças
      const timeoutId = setTimeout(() => {
        saveToDatabase(nodes, edges);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, currentDiagramId]);

  // Conectar edges
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Adicionar novo nó C4
  const handleAddNode = useCallback(() => {
    const tableName = `tabela_${Date.now()}`;
    const newNode = {
      id: `table-${Date.now()}`,
      type: 'c4Node',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: { 
        label: `Tabela ${nodes.length + 1}`,
        description: 'Nova tabela',
        type: 'Table',
        color: '#ffffff',
        tableName: tableName,
        fields: [
          { name: 'id', type: 'INT AUTO_INCREMENT', isPrimaryKey: true },
          { name: 'nome', type: 'VARCHAR(255)', isPrimaryKey: false },
          { name: 'criado_em', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP', isPrimaryKey: false }
        ],
        isEditing: false
      }
    };
    
    setNodes(prev => [...prev, newNode]);
  }, [nodes.length, setNodes]);

  // Limpar diagrama
  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  // Exportar JSON
  const handleExportJson = useCallback(() => {
    const diagramData = {
      nodes,
      edges,
      diagramName,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(diagramData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, diagramName]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar 
        isMinimized={isSidebarMinimized}
        onToggle={() => setIsSidebarMinimized(prev => !prev)}
      />
      
      {/* Área Principal do Diagrama */}
      <div style={{ flexGrow: 1, height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="react-flow-diagram"
          connectionLineType="smoothstep"
          connectionMode="loose"
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
          
          {/* Painel de ferramentas simplificado */}
          <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-3 border">
            <div className="flex items-center gap-6">
              {/* Título do diagrama */}
              <div className="flex items-center">
                <input
                  type="text"
                  value={diagramName}
                  onChange={(e) => setDiagramName(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none outline-none min-w-[200px]"
                  placeholder="Nome do Diagrama"
                />
              </div>
              
              {/* Ferramentas */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddNode}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-blue-500 text-white hover:bg-blue-600"
                >
                  Adicionar Tabela
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-gray-500 text-white hover:bg-gray-600"
                >
                  Limpar
                </button>
                <button
                  onClick={handleExportJson}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-green-500 text-white hover:bg-green-600"
                  title="Exportar diagrama como JSON"
                >
                  Exportar JSON
                </button>
                <button
                  onClick={() => navigate('/access-manager')}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-orange-500 text-white hover:bg-orange-600"
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
};

export default DiagramFlowBasic;
