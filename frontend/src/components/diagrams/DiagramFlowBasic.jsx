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
import OffsetEdge from './OffsetEdge.jsx';
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
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Carregar dados salvos quando a página carrega
  useEffect(() => {
    const loadSavedData = async () => {
      console.log('🔄 === INICIANDO CARREGAMENTO DE DADOS ===');
      setIsLoading(true);
      
      try {
        // Primeiro, tentar carregar do localStorage
        const savedDiagram = localStorage.getItem('currentDiagram');
        
        if (savedDiagram) {
          try {
            const diagramData = JSON.parse(savedDiagram);
            console.log('📦 Dados encontrados no localStorage:', diagramData);
            
            // Validar estrutura dos dados
            if (diagramData && typeof diagramData === 'object') {
              let hasData = false;
              
              if (diagramData.nodes && Array.isArray(diagramData.nodes) && diagramData.nodes.length > 0) {
                console.log(`📊 Aplicando ${diagramData.nodes.length} nodes...`);
                setNodes(diagramData.nodes);
                hasData = true;
              }
              
              if (diagramData.edges && Array.isArray(diagramData.edges) && diagramData.edges.length > 0) {
                console.log(`🔗 Aplicando ${diagramData.edges.length} edges...`);
                setEdges(diagramData.edges);
                hasData = true;
              }
              
              if (diagramData.diagramName && typeof diagramData.diagramName === 'string') {
                console.log(`📝 Nome do diagrama: ${diagramData.diagramName}`);
                setDiagramName(diagramData.diagramName);
              }
              
              if (hasData) {
                console.log('✅ Dados carregados do localStorage com sucesso');
                setDataLoaded(true);
                setIsLoading(false);
                return;
              }
            }
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse dos dados do localStorage:', parseError);
            localStorage.removeItem('currentDiagram'); // Remove dados corrompidos
          }
        }

        console.log('📭 Nenhum dado válido encontrado no localStorage');

        // Se não há dados no localStorage, tentar carregar do backend
        try {
          console.log('🌐 Tentando carregar do backend...');
          const response = await fetch('/api/diagrams/list');
          
          if (response.ok) {
            const data = await response.json();
            console.log('📡 Resposta do backend:', data);
            
            if (data.success && data.diagrams && data.diagrams.length > 0) {
              const latestDiagram = data.diagrams[0];
              console.log(`📋 Diagrama mais recente encontrado: ${latestDiagram.name}`);
              setDiagramName(latestDiagram.name);
              
              // Tentar carregar os itens do diagrama
              const itemsResponse = await fetch(`/api/diagrams/${latestDiagram.id}/items`);
              if (itemsResponse.ok) {
                const items = await itemsResponse.json();
                console.log('🗂️ Itens do diagrama:', items);
                
                // Converter itens do banco para nodes do ReactFlow
                if (Array.isArray(items) && items.length > 0) {
                  const loadedNodes = items.map(item => ({
                    id: item.id,
                    type: 'c4Node',
                    position: { 
                      x: parseFloat(item.position_x) || 0, 
                      y: parseFloat(item.position_y) || 0 
                    },
                    data: {
                      label: item.node_name,
                      description: item.node_description || '',
                      type: item.node_type || 'table'
                    },
                    style: {
                      width: parseInt(item.style_width) || 200,
                      height: parseInt(item.style_height) || 150
                    }
                  }));
                  
                  console.log(`🔄 Convertendo ${loadedNodes.length} itens para nodes...`);
                  setNodes(loadedNodes);
                  setDataLoaded(true);
                }
              }
            }
          }
        } catch (backendError) {
          console.log('⚠️ Erro ao conectar com backend (normal se não estiver rodando):', backendError.message);
        }
        
      } catch (error) {
        console.error('❌ Erro geral ao carregar dados:', error);
      } finally {
        setIsLoading(false);
        console.log('🏁 === CARREGAMENTO FINALIZADO ===');
      }
    };

    // Delay pequeno para garantir que o componente está totalmente montado
    const timeoutId = setTimeout(loadSavedData, 100);
    
    return () => clearTimeout(timeoutId);
  }, []); // Executa apenas uma vez quando o componente monta

  // Salvar dados automaticamente quando há mudanças
  useEffect(() => {
    const saveData = () => {
      try {
        const diagramData = {
          nodes,
          edges,
          diagramName,
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
        
        localStorage.setItem('currentDiagram', JSON.stringify(diagramData));
        console.log(`💾 Dados salvos automaticamente: ${nodes.length} nodes, ${edges.length} edges`);
      } catch (error) {
        console.error('❌ Erro ao salvar no localStorage:', error);
      }
    };

    // Sempre salva, mesmo que não há nodes/edges (para salvar nome do diagrama vazio)
    const timeoutId = setTimeout(saveData, 500); // Debounce de 500ms
    
    return () => clearTimeout(timeoutId); // Cleanup
  }, [nodes, edges, diagramName]);

  // Interceptar F5 e outras formas de sair da página para garantir salvamento
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      console.log('🚨 Página sendo recarregada/fechada - salvando dados...');
      try {
        const diagramData = {
          nodes,
          edges,
          diagramName,
          timestamp: new Date().toISOString(),
          version: '1.0',
          savedOnUnload: true
        };
        
        localStorage.setItem('currentDiagram', JSON.stringify(diagramData));
        console.log('💾 Dados salvos antes de sair da página');
      } catch (error) {
        console.error('❌ Erro ao salvar antes de sair:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Página ficou oculta - salvando dados...');
        handleBeforeUnload();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [nodes, edges, diagramName]);

  // Integração automática with banco de dados
  useEffect(() => {
    const syncWithDatabase = async () => {
      try {
        // Registrar o diagrama no backend primeiro
        const diagramId = `diagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const createDiagramResponse = await fetch('http://localhost:5000/api/diagrams/create-table', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            diagramId,
            diagramName,
            timestamp: new Date().toISOString()
          })
        });

        if (createDiagramResponse.ok) {
          console.log('Diagrama registrado no backend');
        }

        // Para cada node que é uma tabela, criar/atualizar no banco
        const tableNodes = nodes.filter(node => node.type === 'c4Node' && node.data?.tableName);
        
        for (const node of tableNodes) {
          const { tableName, fields = [] } = node.data;
          
          // Verificar se a tabela já existe
          const checkTableQuery = `SHOW TABLES LIKE '${tableName}'`;
          const tableExists = await fetch('http://localhost:5000/api/execute-query', {
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
            
            await fetch('http://localhost:5000/api/execute-query', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: createTableQuery })
            });

            // Inserir dados de exemplo
            const insertQuery = `
              INSERT INTO \`${tableName}\` (nome) 
              VALUES ('Exemplo 1'), ('Exemplo 2')
            `;
            
            await fetch('http://localhost:5000/api/execute-query', {
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

  // Função para salvar manualmente
  const handleSaveManually = useCallback(() => {
    try {
      const diagramData = {
        nodes,
        edges,
        diagramName,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem('currentDiagram', JSON.stringify(diagramData));
      console.log('💾 Salvamento manual realizado com sucesso!');
      alert(`Diagrama salvo! ${nodes.length} tabelas, ${edges.length} conexões`);
    } catch (error) {
      console.error('❌ Erro ao salvar manualmente:', error);
      alert('Erro ao salvar o diagrama');
    }
  }, [nodes, edges, diagramName]);

  // Função de teste para debug
  const testLocalStorage = useCallback(() => {
    console.log('🔍 === DEBUG DO LOCALSTORAGE ===');
    const savedData = localStorage.getItem('currentDiagram');
    
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        console.log('📦 Dados encontrados:', data);
        console.log(`📊 Nodes salvos: ${data.nodes?.length || 0}`);
        console.log(`🔗 Edges salvos: ${data.edges?.length || 0}`);
        console.log(`📝 Nome: ${data.diagramName || 'N/A'}`);
        console.log(`⏰ Timestamp: ${data.timestamp || 'N/A'}`);
        console.log(`🔄 Versão: ${data.version || 'N/A'}`);
        
        console.log('🔄 Forçando recarregamento dos dados...');
        
        // Limpar primeiro
        setNodes([]);
        setEdges([]);
        setDiagramName('Carregando...');
        
        // Aplicar dados após um delay
        setTimeout(() => {
          if (data.nodes && Array.isArray(data.nodes)) {
            console.log('📊 Aplicando nodes:', data.nodes);
            setNodes(data.nodes);
          }
          if (data.edges && Array.isArray(data.edges)) {
            console.log('🔗 Aplicando edges:', data.edges);
            setEdges(data.edges);
          }
          if (data.diagramName) {
            setDiagramName(data.diagramName);
          }
          setDataLoaded(true);
        }, 200);
        
        alert(`Debug: Recarregando ${data.nodes?.length || 0} nodes e ${data.edges?.length || 0} edges`);
      } catch (error) {
        console.error('❌ Erro no parse do localStorage:', error);
        alert('Erro: Dados corrompidos no localStorage');
      }
    } else {
      console.log('📭 Nenhum dado encontrado no localStorage');
      alert('Nenhum dado encontrado no localStorage');
    }
    console.log('🔍 === FIM DO DEBUG ===');
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
      {/* Loading Screen */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
            <div>Carregando diagrama...</div>
          </div>
        </div>
      )}
      
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
          fitView={!isLoading && nodes.length > 0}
          className="react-flow-diagram"
          connectionLineType="smoothstep"
          connectionMode="loose"
          key={`reactflow-${dataLoaded ? 'loaded' : 'empty'}`} // Force re-render quando dados carregam
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
                {/* Indicador de estado */}
                <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                  {nodes.length} tabelas
                </span>
              </div>
              
              {/* Ferramentas */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddNode}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-blue-500 text-white hover:bg-blue-600"
                >
                  + Tabela
                </button>
                <button
                  onClick={handleSaveManually}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-green-500 text-white hover:bg-green-600"
                  title="Salvar diagrama manualmente"
                >
                  💾 Salvar
                </button>
                <button
                  onClick={testLocalStorage}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-purple-500 text-white hover:bg-purple-600"
                  title="Debug e recarregar dados"
                >
                  🔍 Debug
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-gray-500 text-white hover:bg-gray-600"
                >
                  🗑️ Limpar
                </button>
                <button
                  onClick={handleExportJson}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-indigo-500 text-white hover:bg-indigo-600"
                  title="Exportar diagrama como JSON"
                >
                  📁 Exportar
                </button>
                <button
                  onClick={() => navigate('/access-manager')}
                  className="px-3 py-2 text-sm rounded-md transition-colors bg-orange-500 text-white hover:bg-orange-600"
                  title="Gerenciar acessos do sistema"
                >
                  👥 Acessos
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
