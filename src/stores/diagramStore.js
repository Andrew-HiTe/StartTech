import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from '@xyflow/react';

export const useDiagramStore = create((set, get) => ({
  // State
  nodes: [
    {
      id: 'sample-1',
      type: 'c4Node',
      position: { x: 250, y: 100 },
      data: {
        title: 'Web Application',
        description: 'Entrypoint da aplicação web\nInterage com usuários\nHTML/React/TypeScript',
        type: 'system',
        width: 180,
        height: 120
      },
      style: {
        width: 180,
        height: 120
      }
    },
    {
      id: 'sample-2', 
      type: 'c4Node',
      position: { x: 500, y: 100 },
      data: {
        title: 'API Gateway',
        description: 'Gateway de entrada\nAutenticação e roteamento\nNode.js/Express',
        type: 'container',
        width: 180,
        height: 120
      },
      style: {
        width: 180,
        height: 120
      }
    },
    {
      id: 'sample-3',
      type: 'c4Node', 
      position: { x: 750, y: 100 },
      data: {
        title: 'Database',
        description: 'Armazenamento de dados\nPostgreSQL\nTabelas principais',
        type: 'component',
        width: 180,
        height: 120
      },
      style: {
        width: 180,
        height: 120
      }
    }
  ],
  edges: [
    {
      id: 'e1-2',
      source: 'sample-1',
      target: 'sample-2',
      sourceHandle: 'right',
      targetHandle: 'left-target',
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: '#2196f3', 
        strokeWidth: 3,
        strokeDasharray: '5,5'
      }
    },
    {
      id: 'e2-3',
      source: 'sample-2',
      target: 'sample-3',
      sourceHandle: 'bottom',
      targetHandle: 'top-target',
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: '#2196f3', 
        strokeWidth: 3,
        strokeDasharray: '5,5'
      }
    }
  ],
  selectedElements: [],
  isConnecting: false,
  connectionMode: false,
  currentTool: 'select',
  diagramName: 'Novo Diagrama C4',
  lastNodeCreation: 0, // Timestamp da última criação de nó

  // Actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    // Log das mudanças para debug
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        console.log(`📍 Nó ${change.id} movido para:`, change.position);
      } else if (change.type === 'select') {
        console.log(`🎯 Nó ${change.id} ${change.selected ? 'selecionado' : 'desselecionado'}`);
      } else if (change.type === 'dimensions' && change.dimensions) {
        console.log(`📏 Nó ${change.id} redimensionado:`, change.dimensions);
      }
    });

    set({
      nodes: applyNodeChanges(changes, get().nodes)
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges)
    });
  },
  
  onConnect: (connection) => {
    const { source, target, sourceHandle, targetHandle } = connection;
    
    // Validações básicas
    if (!source || !target || source === target) {
      return;
    }
    
    console.log('🔄 Processando nova conexão:', { source, target, sourceHandle, targetHandle });
    
    const currentEdges = get().edges;
    
    // ESTRATÉGIA: Substituir qualquer conexão existente entre os mesmos nós
    // Buscar conexões existentes entre source e target (em qualquer direção)
    const existingConnections = currentEdges.filter(edge => 
      (edge.source === source && edge.target === target) ||
      (edge.source === target && edge.target === source)
    );
    
    if (existingConnections.length > 0) {
      console.log(`🔄 Encontradas ${existingConnections.length} conexão(ões) existente(s) entre ${source} e ${target}`);
      console.log('🗑️ Removendo conexões antigas para substituir...');
      
      // Remover conexões existentes
      existingConnections.forEach(edge => {
        console.log(`   - Removendo conexão: ${edge.id}`);
      });
    }
    
    // Filtrar edges removendo as conexões existentes entre esses nós
    const edgesWithoutExisting = currentEdges.filter(edge => 
      !((edge.source === source && edge.target === target) ||
        (edge.source === target && edge.target === source))
    );
    
    // Criar nova conexão
    const newEdge = {
      id: `e${source}-${target}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      source: source,
      target: target,
      sourceHandle: sourceHandle || undefined,
      targetHandle: targetHandle || undefined,
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: '#2196f3', 
        strokeWidth: 3, // Usando strokeWidth 3 como no TypeScript
        strokeDasharray: '5,5' // Usando padrão que funcionava
      }
    };
    
    // Adicionar nova conexão aos edges filtrados
    const updatedEdges = [...edgesWithoutExisting, newEdge];
    
    console.log('✅ Nova conexão criada (substituindo antigas):', newEdge.id);
    console.log(`📊 Total de edges: ${currentEdges.length} → ${updatedEdges.length}`);
    
    set({
      edges: updatedEdges,
      isConnecting: false,
      connectionMode: false
    });
  },
  
  addNode: (position) => {
    const existingNodes = get().nodes;
    
    // Aplicar as mesmas proteções do addNodeWithSize
    const MINIMUM_DISTANCE = 50;
    const tooClose = existingNodes.some(node => {
      const distance = Math.sqrt(
        Math.pow(node.position.x - position.x, 2) + 
        Math.pow(node.position.y - position.y, 2)
      );
      return distance < MINIMUM_DISTANCE;
    });
    
    if (tooClose) {
      console.log('⚠️ Posição muito próxima de nó existente, criação cancelada');
      return null;
    }
    
    // Throttling temporal
    const now = Date.now();
    const lastCreationTime = get().lastNodeCreation || 0;
    const TIME_THRESHOLD = 300;
    
    if (now - lastCreationTime < TIME_THRESHOLD) {
      console.log('⚠️ Criação muito rápida, aguarde um momento');
      return null;
    }
    
    // Limite máximo
    if (existingNodes.length >= 50) {
      console.log('⚠️ Limite máximo de nós atingido');
      return null;
    }
    
    const id = `node-${now}-${Math.random().toString(36).substr(2, 6)}`;
    const newNode = {
      id,
      type: 'c4Node',
      position,
      data: {
        title: `Nova Tabela ${existingNodes.length + 1}`,
        description: 'Duplo clique para editar\nDescrição do componente',
        type: 'system',
        width: 180,
        height: 120
      },
      style: {
        width: 180,
        height: 120,
      }
    };
    
    newNode.resizable = true;
    
    console.log('✅ Nó criado com sucesso:', newNode.id);
    
    set({
      nodes: [...existingNodes, newNode],
      lastNodeCreation: now
    });
    
    return newNode;
  },

  addNodeWithSize: (position, size) => {
    console.log('📝 Adicionando nó:', { position, size });
    
    const existingNodes = get().nodes;
    
    // PROTEÇÃO 1: Verificar posição muito próxima (evita cliques duplos)
    const MINIMUM_DISTANCE = 50; // Aumentado de 30 para 50px
    const tooClose = existingNodes.some(node => {
      const distance = Math.sqrt(
        Math.pow(node.position.x - position.x, 2) + 
        Math.pow(node.position.y - position.y, 2)
      );
      return distance < MINIMUM_DISTANCE;
    });
    
    if (tooClose) {
      console.log('⚠️ VALIDAÇÃO FALHOU: Posição muito próxima de nó existente (min: 50px)');
      return null; // Retorna null para indicar falha
    }
    
    // PROTEÇÃO 2: Throttling temporal (evita criação muito rápida)
    const now = Date.now();
    const lastCreationTime = get().lastNodeCreation || 0;
    const TIME_THRESHOLD = 300; // 300ms entre criações
    
    if (now - lastCreationTime < TIME_THRESHOLD) {
      console.log('⚠️ VALIDAÇÃO FALHOU: Criação muito rápida (min: 300ms entre criações)');
      return null;
    }
    
    // PROTEÇÃO 3: Limite máximo de nós
    const MAX_NODES = 50; // Limite razoável
    if (existingNodes.length >= MAX_NODES) {
      console.log('⚠️ VALIDAÇÃO FALHOU: Limite máximo de nós atingido (max: 50)');
      return null;
    }
    
    // PROTEÇÃO 4: Verificar área de sobreposição
    const nodeWidth = Math.max(size.width, 180);
    const nodeHeight = Math.max(size.height, 120);
    
    const wouldOverlap = existingNodes.some(node => {
      const nodeDataWidth = node.data?.width || 180;
      const nodeDataHeight = node.data?.height || 120;
      
      // Verificar sobreposição de retângulos
      const overlap = !(
        position.x > node.position.x + nodeDataWidth ||
        position.x + nodeWidth < node.position.x ||
        position.y > node.position.y + nodeDataHeight ||
        position.y + nodeHeight < node.position.y
      );
      
      return overlap;
    });
    
    if (wouldOverlap) {
      console.log('⚠️ VALIDAÇÃO FALHOU: Novo nó sobreporia nó existente');
      return null;
    }
    
    // Se passou por todas as validações, criar o nó
    const id = `node-${now}-${Math.random().toString(36).substr(2, 6)}`;
    const minWidth = 180;
    const minHeight = 120;
    
    const finalWidth = Math.max(size.width, minWidth);
    const finalHeight = Math.max(size.height, minHeight);
    
    const newNode = {
      id,
      type: 'c4Node',
      position,
      data: {
        title: `Nova Tabela ${existingNodes.length + 1}`,
        description: 'Duplo clique para editar\nDescrição do componente',
        type: 'system',
        width: finalWidth,
        height: finalHeight
      },
      style: {
        width: finalWidth,
        height: finalHeight,
      }
    };

    newNode.resizable = true;
    
    console.log('✅ Nó criado com sucesso:', newNode.id);
    
    // Atualizar estado com novo nó e timestamp
    set({
      nodes: [...existingNodes, newNode],
      lastNodeCreation: now // Salvar timestamp da última criação
    });
    
    return newNode; // Retorna o nó criado para confirmação
  },
  
  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(node => node.id !== nodeId),
      edges: get().edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      )
    });
  },
  
  deleteEdge: (edgeId) => {
    set({
      edges: get().edges.filter(edge => edge.id !== edgeId)
    });
  },
  
  setSelectedElements: (elements) => set({ selectedElements: elements }),
  
  setCurrentTool: (tool) => {
    console.log('🔧 setCurrentTool chamado:', tool);
    set({ 
      currentTool: tool,
      connectionMode: false,
      isConnecting: false 
    });
  },
  
  setIsConnecting: (connecting) => set({ isConnecting: connecting }),
  
  setConnectionMode: (mode) => set({ connectionMode: mode }),
  
  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    });
  },

  updateNodeSize: (nodeId, width, height) => {
    const finalWidth = Math.max(width, 180); // Tamanho mínimo
    const finalHeight = Math.max(height, 120);
    
    const { nodes } = get();
    const nodeIndex = nodes.findIndex(node => node.id === nodeId);
    
    if (nodeIndex === -1) return;
    
    const updatedNodes = [...nodes];
    const node = updatedNodes[nodeIndex];
    
    // Atualização direta sem spread operator para reduzir delay
    updatedNodes[nodeIndex] = {
      ...node,
      data: {
        ...node.data,
        width: finalWidth,
        height: finalHeight
      }
    };
    
    set({ nodes: updatedNodes });
  },

  updateNodeSizeAndPosition: (nodeId, width, height, deltaX = 0, deltaY = 0) => {
    const finalWidth = Math.max(width, 180);
    const finalHeight = Math.max(height, 120);
    
    const { nodes } = get();
    const nodeIndex = nodes.findIndex(node => node.id === nodeId);
    
    if (nodeIndex === -1) return;
    
    const updatedNodes = [...nodes];
    const node = updatedNodes[nodeIndex];
    
    updatedNodes[nodeIndex] = {
      ...node,
      position: {
        x: node.position.x + deltaX,
        y: node.position.y + deltaY
      },
      data: {
        ...node.data,
        width: finalWidth,
        height: finalHeight
      }
    };
    
    set({ nodes: updatedNodes });
  },

  exportDiagram: () => {
    const { nodes, edges } = get();
    const diagram = { nodes, edges };
    const dataStr = JSON.stringify(diagram, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `c4-diagram-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  setDiagramName: (name) => set({ diagramName: name }),

  // Integration with DiagramManager
  loadDiagramData: (nodes, edges) => {
    set({ 
      nodes: nodes || [], 
      edges: edges || [],
      selectedElements: [],
      currentTool: 'select'
    });
  },

  getCurrentDiagramData: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  clearDiagram: () => {
    set({
      nodes: [],
      edges: [],
      selectedElements: [],
      currentTool: 'select'
    });
  }
}));
