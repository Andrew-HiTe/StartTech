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

  // Integração automática com banco de dados
  useEffect(() => {
    const syncWithDatabase = async () => {
      try {
        // Para cada node que é uma tabela, criar/atualizar no banco
        const tableNodes = nodes.filter(node => node.type === 'c4Node' && node.data?.tableName);
        
        for (const node of tableNodes) {
          const { tableName, fields = [] } = node.data;
          
          // Verificar se a tabela já existe
          const checkTableQuery = `SHOW TABLES LIKE '${tableName}'`;
          const tableExists = await fetch('http://localhost:3001/api/execute-query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: checkTableQuery })
          });
          
          const tableExistsResult = await tableExists.json();
          
          if (!tableExistsResult.results || tableExistsResult.results.length === 0) {
            // Criar tabela no banco se não existir
            const createTableQuery = `
              CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ${fields.filter(f => f.name !== 'id').map(field => 
                  `\`${field.name}\` ${field.type || 'VARCHAR(255)'}`
                ).join(',\n                ')}
              )
            `;
            
            await fetch('http://localhost:3001/api/execute-query', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: createTableQuery })
            });

            // Inserir dados de exemplo
            const insertQuery = `
              INSERT INTO \`${tableName}\` (nome) 
              VALUES ('Exemplo 1'), ('Exemplo 2')
            `;
            
            await fetch('http://localhost:3001/api/execute-query', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: insertQuery })
            });
          }
        }
      } catch (error) {
        console.log('Database sync skipped:', error.message);
      }
    };

    if (nodes.length > 0) {
      syncWithDatabase();
    }
  }, [nodes]);

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
