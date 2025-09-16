import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from '@xyflow/react';
import { 
  listDiagrams, 
  loadDiagram, 
  saveDiagram, 
  updateDiagram, 
  deleteDiagram,
  formatDiagramData 
} from '../services/diagramApi.js';

export const useDiagramStore = create((set, get) => ({
  // State - Inicia vazio, sem diagramas de exemplo
  nodes: [],
  edges: [],
  selectedElements: [],
  isConnecting: false,
  connectionMode: false,
  currentTool: 'select',
  diagramName: 'Novo Diagrama C4',
  lastNodeCreation: 0, // Timestamp da última criação de nó
  
  // Persistência state
  currentDiagramId: null,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  isDirty: false, // Se há mudanças não salvas
  availableDiagrams: [],
  autoSaveEnabled: true,

  // Access Control state
  userPermissions: {},
  visibleTables: new Set(),
  isOwner: true, // ⚠️ TEMPORÁRIO: Definir como true por padrão para debug
  hasAccess: true, // Por padrão, assume que tem acesso (será validado)

  // Getters que aplicam filtros de acesso
  getVisibleNodes: () => {
    const state = get();
    const nodes = [...state.nodes]; // Cria uma cópia para evitar mutações
    console.log('🔍 getVisibleNodes chamado - Total nodes:', nodes.length);
    return nodes;
    
    // Código original comentado temporariamente
    /*
    if (state.isOwner || !state.currentDiagramId) {
      console.log('✅ Mostrando todos os nós (owner ou sem diagrama)');
      return state.nodes;
    }

    if (!state.hasAccess) {
      console.log('❌ Sem acesso ao diagrama, escondendo todos os nós');
      return [];
    }

    const filteredNodes = state.nodes.filter(node => {
      if (!node.data.classificationId) {
        return true;
      }
      const permission = state.userPermissions[node.data.classificationId];
      return permission && ['view', 'edit', 'admin'].includes(permission);
    });
    
    return filteredNodes;
    */
  },

  getVisibleEdges: () => {
    const state = get();
    console.log('🔗 getVisibleEdges - DEBUG MODE:', {
      totalEdges: state.edges.length,
      edges: state.edges,
      retornando: 'TODAS as arestas (debug ativo)'
    });
    
    return state.edges;
    
    // Código original comentado temporariamente
    /*
    const visibleNodes = state.getVisibleNodes();
    const visibleNodeIds = visibleNodes.map(n => n.id);

    return state.edges.filter(edge => 
      visibleNodeIds.includes(edge.source) && 
      visibleNodeIds.includes(edge.target)
    );
    */
  },

  // Actions
  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),
  
  onNodesChange: (changes) => {
    // Log das mudanças para debug
    let hasMeaningfulChange = false;
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        console.log(`📍 Nó ${change.id} movido para:`, change.position);
        hasMeaningfulChange = true;
      } else if (change.type === 'select') {
        console.log(`🎯 Nó ${change.id} ${change.selected ? 'selecionado' : 'desselecionado'}`);
        // Select/deselect não marca como dirty
      } else if (change.type === 'dimensions' && change.dimensions) {
        console.log(`📏 Nó ${change.id} redimensionado:`, change.dimensions);
        hasMeaningfulChange = true;
      } else if (change.type === 'add' || change.type === 'remove') {
        hasMeaningfulChange = true;
      }
    });

    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: hasMeaningfulChange ? true : get().isDirty
    });
  },
  
  onEdgesChange: (changes) => {
    let hasMeaningfulChange = false;
    changes.forEach(change => {
      if (change.type === 'add' || change.type === 'remove') {
        hasMeaningfulChange = true;
      }
    });

    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: hasMeaningfulChange ? true : get().isDirty
    });
  },
  
  onConnect: (connection) => {
    console.log('🔄 [STORE] onConnect chamado:', connection);
    const { source, target, sourceHandle, targetHandle } = connection;
    
    if (!source || !target || source === target) {
      console.log('❌ [STORE] Conexão inválida:', { source, target });
      return;
    }

    console.log('✅ [STORE] Processando conexão válida');
    const currentEdges = get().edges;
    
    // Remove conexões existentes entre os mesmos nós
    const edgesWithoutExisting = currentEdges.filter(edge => 
      !((edge.source === source && edge.target === target) ||
        (edge.source === target && edge.target === source))
    );
    console.log('🔗 [STORE] Edges filtrados:', edgesWithoutExisting.length, 'de', currentEdges.length);
    
    // Cria nova conexão
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
        strokeWidth: 3,
        strokeDasharray: '5,5'
      }
    };
    console.log('✅ [STORE] Nova edge criada:', newEdge);
    
    const updatedEdges = [...edgesWithoutExisting, newEdge];
    console.log('📊 [STORE] Total edges após atualização:', updatedEdges.length);
    
    console.log('🔄 [STORE] Atualizando estado...');
    set({
      edges: updatedEdges,
      hasChanges: true,
      isDirty: true
    });
    console.log('✅ [STORE] Estado atualizado com nova conexão');
    
    // Disparar auto-save após criar conexão
    console.log('🔄 [STORE] Disparando auto-save após criar conexão...');
    setTimeout(() => {
      get().autoSave();
    }, 100); // Pequeno delay para garantir que o estado foi atualizado
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
    
    const updatedNodes = [...existingNodes, newNode];
    console.log('📊 Estado após criação:', {
      nodesBefore: existingNodes.length,
      nodesAfter: updatedNodes.length,
      newNodeId: newNode.id,
      newNodePosition: newNode.position
    });
    
    set({
      nodes: updatedNodes,
      lastNodeCreation: now,
      isDirty: true
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
      
      if (overlap) {
        console.log('🔍 SOBREPOSIÇÃO detectada com nó:', {
          noExistente: { id: node.id, position: node.position, size: { width: nodeDataWidth, height: nodeDataHeight } },
          novoNo: { position, size: { width: nodeWidth, height: nodeHeight } }
        });
      }
      
      return overlap;
    });
    
    if (wouldOverlap) {
      console.log('⚠️ VALIDAÇÃO FALHOU: Novo nó sobreporia nó existente');
      console.log('📊 Nós existentes que causaram sobreposição:', existingNodes.map(n => ({ 
        id: n.id, 
        position: n.position,
        visible: 'verificar getVisibleNodes()'
      })));
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
      lastNodeCreation: now, // Salvar timestamp da última criação
      isDirty: true
    });
    
    return newNode; // Retorna o nó criado para confirmação
  },
  
  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(node => node.id !== nodeId),
      edges: get().edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      ),
      isDirty: true
    });
  },
  
  deleteEdge: (edgeId) => {
    set({
      edges: get().edges.filter(edge => edge.id !== edgeId),
      isDirty: true
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
      ),
      isDirty: true
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
      currentTool: 'select',
      isDirty: false
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
      currentTool: 'select',
      currentDiagramId: null,
      isDirty: false,
      diagramName: 'Novo Diagrama C4'
    });
  },

  // ====================================================
  // AÇÕES DE PERSISTÊNCIA NO BANCO DE DADOS
  // ====================================================

  // Marcar como "sujo" (alterações não salvas)
  markDirty: () => {
    set({ isDirty: true });
  },

  // Carregar lista de diagramas disponíveis
  loadAvailableDiagrams: async () => {
    set({ isLoading: true });
    try {
      const result = await listDiagrams();
      if (result.success) {
        set({ 
          availableDiagrams: result.diagrams,
          isLoading: false 
        });
        return { success: true, diagrams: result.diagrams };
      } else {
        console.error('❌ Erro ao carregar lista de diagramas:', result.error);
        set({ isLoading: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar diagramas:', error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Carregar diagrama específico do banco
  loadDiagramFromDB: async (diagramId) => {
    console.log('📂 Carregando diagrama do banco...', diagramId);
    set({ isLoading: true });
    try {
      const result = await loadDiagram(diagramId);
      console.log('📦 Resultado do loadDiagram:', result);
      
      if (result.success && result.diagram) {
        const { data, name, id } = result.diagram;
        
        console.log('📊 Dados do diagrama carregados:', {
          nome: name,
          id: id,
          nodes: data.nodes?.length || 0,
          edges: data.edges?.length || 0
        });
        
        // Carregar permissões do usuário para este diagrama primeiro
        await get().loadUserPermissions(id);
        
        // DEBUG: Verificar os dados antes de definir
        console.log('🔧 DEBUG EDGES - Antes de set():', {
          dataEdges: data.edges,
          dataEdgesLength: data.edges?.length,
          dataNodes: data.nodes?.length
        });

        // Depois atualizar o estado uma única vez
        set({
          nodes: data.nodes || [],
          edges: data.edges || [],
          diagramName: name,
          currentDiagramId: id,
          isDirty: false,
          lastSaved: new Date(),
          isLoading: false,
          selectedElements: []
        });

        // DEBUG: Verificar o estado após set()
        const newState = get();
        console.log('🔧 DEBUG EDGES - Após set():', {
          stateEdges: newState.edges,
          stateEdgesLength: newState.edges?.length,
          stateNodes: newState.nodes?.length
        });
        
        console.log(`✅ Diagrama "${name}" carregado com sucesso - ${data.nodes?.length || 0} nós e ${data.edges?.length || 0} conexões`);
        return { success: true, diagram: result.diagram };
      } else {
        console.error('❌ Erro ao carregar diagrama:', result.error);
        set({ isLoading: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro ao carregar diagrama:', error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Salvar diagrama atual (novo ou atualização)
  saveDiagramToDB: async (name) => {
    const state = get();
    const { nodes, edges, currentDiagramId } = state;
    
    console.log('💾 [SAVE] Salvando diagrama:', { 
      name, 
      currentDiagramId, 
      nodesCount: nodes.length, 
      edgesCount: edges.length 
    });
    
    if (!name || !name.trim()) {
      return { success: false, error: 'Nome do diagrama é obrigatório' };
    }

    set({ isSaving: true });
    
    try {
      const diagramData = formatDiagramData(nodes, edges);
      let result;

      if (currentDiagramId) {
        // Atualizar diagrama existente
        result = await updateDiagram(currentDiagramId, name.trim(), diagramData);
      } else {
        // Criar novo diagrama
        result = await saveDiagram(name.trim(), diagramData);
      }

      if (result.success) {
        set({
          diagramName: name.trim(),
          currentDiagramId: result.diagramId || currentDiagramId,
          isDirty: false,
          lastSaved: new Date(),
          isSaving: false
        });
        
        // Recarregar lista de diagramas
        get().loadAvailableDiagrams();
        
        console.log('✅ Diagrama salvo com sucesso');
        return { success: true, message: result.message };
      } else {
        console.error('❌ Erro ao salvar diagrama:', result.error);
        set({ isSaving: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro ao salvar diagrama:', error);
      set({ isSaving: false });
      return { success: false, error: error.message };
    }
  },

  // Auto-save (save silencioso)
  autoSave: async () => {
    const state = get();
    const { autoSaveEnabled, isDirty, currentDiagramId, diagramName, nodes, edges } = state;
    
    console.log('🔄 [AUTO-SAVE] Estado atual:', { 
      autoSaveEnabled, 
      isDirty, 
      currentDiagramId, 
      diagramName,
      nodesCount: nodes.length,
      edgesCount: edges.length
    });
    
    if (!autoSaveEnabled || !isDirty || !currentDiagramId) {
      console.log('🔄 [AUTO-SAVE] Condições não atendidas - cancelando auto-save');
      return;
    }

    console.log('🔄 [AUTO-SAVE] Executando auto-save...', { diagramName, edgesCount: edges.length });
    const result = await get().saveDiagramToDB(diagramName);
    
    if (result.success) {
      console.log('✅ [AUTO-SAVE] Auto-save concluído com sucesso');
    } else {
      console.error('❌ [AUTO-SAVE] Erro no auto-save:', result.error);
    }
  },

  // Excluir diagrama
  deleteDiagramFromDB: async (diagramId) => {
    set({ isLoading: true });
    try {
      const result = await deleteDiagram(diagramId);
      if (result.success) {
        // Se foi o diagrama atual, limpar
        const { currentDiagramId } = get();
        if (currentDiagramId === diagramId) {
          get().clearDiagram();
        }
        
        // Recarregar lista
        await get().loadAvailableDiagrams();
        
        set({ isLoading: false });
        console.log('✅ Diagrama excluído com sucesso');
        return { success: true, message: result.message };
      } else {
        console.error('❌ Erro ao excluir diagrama:', result.error);
        set({ isLoading: false });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro ao excluir diagrama:', error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // Criar novo diagrama (limpar atual)
  createNewDiagram: () => {
    set({
      nodes: [],
      edges: [],
      selectedElements: [],
      currentTool: 'select',
      currentDiagramId: null,
      isDirty: false,
      diagramName: 'Novo Diagrama C4',
      lastSaved: null
    });
    console.log('✅ Novo diagrama criado');
  },

  // Toggle auto-save
  toggleAutoSave: () => {
    set((state) => ({ autoSaveEnabled: !state.autoSaveEnabled }));
  },

  // ====================================================
  // FUNÇÕES DE CONTROLE DE ACESSO
  // ====================================================

  // Carregar permissões do usuário para o diagrama atual
  loadUserPermissions: async (diagramId) => {
    if (!diagramId) return;

    try {
      const token = localStorage.getItem('authToken');
      console.log('🔐 loadUserPermissions chamado:', { diagramId, hasToken: !!token });
      
      if (!token) {
        console.error('❌ Token não encontrado no localStorage');
        set({
          userPermissions: {},
          visibleTables: new Set(),
          isOwner: false,
          hasAccess: false
        });
        return { success: false, error: 'Token não encontrado' };
      }

      // Verificar acesso geral ao diagrama
      const response = await fetch(`http://localhost:3001/api/diagrams/${diagramId}/access`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔐 Resposta da API access:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        
        // Se tem acesso, carregar também as classificações para saber quais tabelas pode ver
        let classificationPermissions = {};
        
        if (data.success) {
          // Carregar classificações do diagrama
          const classResponse = await fetch(`http://localhost:3001/api/diagrams/${diagramId}/classifications`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (classResponse.ok) {
            const classData = await classResponse.json();
            
            if (classData.success && classData.classifications) {
              // Para cada classificação, assumir permissão baseada no nível de acesso do usuário
              classData.classifications.forEach(classification => {
                if (data.isOwner || data.accessLevel === 'admin') {
                  classificationPermissions[classification.id] = 'admin';
                } else if (data.accessLevel === 'edit') {
                  classificationPermissions[classification.id] = 'edit';
                } else if (data.accessLevel === 'view') {
                  classificationPermissions[classification.id] = 'view';
                }
              });
            }
          }
        }

        set({
          userPermissions: classificationPermissions,
          visibleTables: new Set(), // Por enquanto, controlar por classificação
          isOwner: data.isOwner || false,
          hasAccess: data.success || false
        });
        
        console.log('✅ Permissões do usuário carregadas:', {
          isOwner: data.isOwner,
          hasAccess: data.success,
          accessLevel: data.accessLevel,
          classificationPermissions
        });
        
        return { success: true, data };
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao carregar acesso ao diagrama:', errorData.error);
        set({
          userPermissions: {},
          visibleTables: new Set(),
          isOwner: false,
          hasAccess: false
        });
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('❌ Erro de conexão ao carregar permissões:', error);
      set({
        userPermissions: {},
        visibleTables: new Set(),
        isOwner: false,
        hasAccess: false
      });
      return { success: false, error: error.message };
    }
  },

  // Verificar se usuário pode ver uma tabela específica
  canViewTable: (tableNodeId, classificationId) => {
    const state = get();
    
    // Se é dono do diagrama, pode ver tudo
    if (state.isOwner) return true;

    // Se não tem acesso ao diagrama, não pode ver nada
    if (!state.hasAccess) return false;

    // Se a tabela está na lista de visíveis explicitamente
    if (state.visibleTables.has(tableNodeId)) return true;

    // Verificar permissão por classificação
    if (classificationId && state.userPermissions[classificationId]) {
      return ['view', 'edit', 'admin'].includes(state.userPermissions[classificationId]);
    }

    // Se não tem classificação específica, verificar se tem acesso básico
    return state.hasAccess;
  },

  // Verificar se usuário pode editar uma tabela
  canEditTable: (tableNodeId, classificationId) => {
    const state = get();
    
    // Se é dono do diagrama, pode editar tudo
    if (state.isOwner) return true;

    // Se não tem acesso ao diagrama, não pode editar nada
    if (!state.hasAccess) return false;

    // Verificar permissão de edição por classificação
    if (classificationId && state.userPermissions[classificationId]) {
      return ['edit', 'admin'].includes(state.userPermissions[classificationId]);
    }

    return false;
  },

  // Verificar se usuário pode administrar (configurar classificações)
  canAdminister: () => {
    const state = get();
    return state.isOwner; // Apenas donos podem administrar por enquanto
  },

  // Atualizar classificação de uma tabela
  updateTableClassification: async (tableNodeId, classificationId) => {
    const state = get();
    
    if (!state.currentDiagramId) {
      console.error('❌ Não há diagrama carregado');
      return { success: false, error: 'Não há diagrama carregado' };
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/tables/${tableNodeId}/classification`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          classificationId: classificationId,
          diagramId: state.currentDiagramId
        })
      });

      if (response.ok) {
        // Atualizar o nó no store com a nova classificação
        const updatedNodes = state.nodes.map(node => {
          if (node.id === tableNodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                classificationId: classificationId
              }
            };
          }
          return node;
        });

        set({ nodes: updatedNodes, isDirty: true });
        console.log('✅ Classificação da tabela atualizada');
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao atualizar classificação:', errorData.error);
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('❌ Erro de conexão ao atualizar classificação:', error);
      return { success: false, error: error.message };
    }
  }
}));
