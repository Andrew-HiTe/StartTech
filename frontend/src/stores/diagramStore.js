// Zustand store for managing diagram state
import { create } from 'zustand';
import { 
  applyNodeChanges, 
  applyEdgeChanges,
  addEdge
} from '@xyflow/react';
import diagramService from '../services/diagramService.js';

const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const useDiagramStore = create((set, get) => ({
  // Estado inicial
  nodes: [],
  edges: [],
  selectedElements: [],
  isConnecting: false,
  connectionMode: false,
  currentTool: 'select',
  diagramName: 'Novo Diagrama',
  currentDiagramId: null, // Adicionar ID do diagrama atual

  // Ações
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setCurrentDiagramId: (id) => set({ currentDiagramId: id }),
  
  // Carregar dados do diagrama
  loadDiagramData: (nodes, edges) => {
    set({ 
      nodes: nodes || [], 
      edges: edges || [] 
    });
  },
  
  // Obter dados atuais do diagrama
  getCurrentDiagramData: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },
  
  onNodesChange: (changes) => {
    const { nodes } = get();
    const newNodes = applyNodeChanges(changes, nodes);
    set({ nodes: newNodes });
  },
  
  onEdgesChange: (changes) => {
    const { edges } = get();
    const newEdges = applyEdgeChanges(changes, edges);
    set({ edges: newEdges });
  },
  
  onConnect: (connection) => {
    const { edges } = get();
    console.log('🔗 Conectando:', connection);
    
    if (!connection.source || !connection.target) {
      console.warn('❌ Conexão inválida - source ou target ausente');
      return;
    }
    
    if (connection.source === connection.target) {
      console.warn('❌ Não é possível conectar nó a si mesmo');
      return;
    }
    
    const newEdge = {
      ...connection,
      id: `edge_${connection.source}_${connection.target}_${Date.now()}`,
      type: 'offset',
      animated: false,
      style: { stroke: '#b1b1b7', strokeWidth: 2 },
    };
    
    const newEdges = addEdge(newEdge, edges);
    set({ edges: newEdges });
  },
  
  addNode: (position) => {
    const { nodes } = get();
    const newNode = {
      id: generateId(),
      type: 'c4Node',
      position,
      data: {
        title: 'Novo Componente',
        description: 'Descrição do componente',
        type: 'component'
      },
      style: {
        width: 200,
        height: 100
      }
    };
    
    set({ nodes: [...nodes, newNode] });
  },
  
  addNodeWithSize: async (position, size) => {
    const { nodes, currentDiagramId } = get();
    const newNode = {
      id: generateId(),
      type: 'c4Node',
      position,
      data: {
        title: 'Nova Tabela',
        description: 'Descrição da tabela',
        type: 'table'
      },
      style: {
        width: size?.width || 200,
        height: size?.height || 150
      }
    };

    // Adicionar nó localmente primeiro
    set({ nodes: [...nodes, newNode] });

    // Tentar adicionar no banco de dados
    if (currentDiagramId) {
      try {
        await diagramService.addTableToDiagram(currentDiagramId, newNode);
        console.log(`✅ Tabela "${newNode.data.title}" adicionada ao banco para diagrama ${currentDiagramId}`);
      } catch (error) {
        console.error(`❌ Erro ao adicionar tabela ao banco:`, error);
        // Manter o nó localmente mesmo se falhar no banco
      }
    } else {
      console.warn('⚠️ Nenhum diagrama ativo para salvar no banco');
    }
  },
  
  deleteNode: async (nodeId) => {
    const { nodes, edges, currentDiagramId } = get();
    const newNodes = nodes.filter(node => node.id !== nodeId);
    const newEdges = edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
    
    set({ nodes: newNodes, edges: newEdges });

    // Tentar remover do banco de dados
    if (currentDiagramId) {
      try {
        await diagramService.removeTableFromDiagram(currentDiagramId, nodeId);
        console.log(`✅ Tabela ${nodeId} removida do banco para diagrama ${currentDiagramId}`);
      } catch (error) {
        console.error(`❌ Erro ao remover tabela do banco:`, error);
      }
    }
  },
  
  deleteEdge: (edgeId) => {
    const { edges } = get();
    const newEdges = edges.filter(edge => edge.id !== edgeId);
    set({ edges: newEdges });
  },
  
  setSelectedElements: (elements) => set({ selectedElements: elements }),
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setIsConnecting: (connecting) => set({ isConnecting: connecting }),
  setConnectionMode: (mode) => set({ connectionMode: mode }),
  setDiagramName: (name) => set({ diagramName: name }),
  
  updateNodeData: async (nodeId, data) => {
    const { nodes, currentDiagramId } = get();
    const newNodes = nodes.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...data } }
        : node
    );
    set({ nodes: newNodes });

    // Tentar atualizar no banco de dados
    if (currentDiagramId) {
      const updatedNode = newNodes.find(node => node.id === nodeId);
      if (updatedNode) {
        try {
          await diagramService.updateTableInDiagram(currentDiagramId, updatedNode);
          console.log(`✅ Tabela ${nodeId} atualizada no banco para diagrama ${currentDiagramId}`);
        } catch (error) {
          console.error(`❌ Erro ao atualizar tabela no banco:`, error);
        }
      }
    }
  },
  
  updateNodeSize: (nodeId, width, height) => {
    const { nodes } = get();
    const newNodes = nodes.map(node => 
      node.id === nodeId 
        ? { ...node, style: { ...node.style, width, height } }
        : node
    );
    set({ nodes: newNodes });
  },
  
  exportDiagram: () => {
    const { nodes, edges, diagramName } = get();
    const diagramData = {
      name: diagramName,
      nodes,
      edges,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(diagramData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName.replace(/\\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}));

export default useDiagramStore;
