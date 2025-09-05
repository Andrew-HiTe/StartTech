// Zustand store for managing diagram state
import { create } from 'zustand';
import { 
  type Node, 
  type Edge, 
  applyNodeChanges, 
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
  addEdge
} from '@xyflow/react';

export interface C4NodeData {
  title: string;
  description: string;
  type: 'system' | 'container' | 'component' | 'person';
  [key: string]: unknown;
}

export type C4Node = Node<C4NodeData>;

export interface DiagramState {
  nodes: C4Node[];
  edges: Edge[];
  selectedElements: string[];
  isConnecting: boolean;
  connectionMode: boolean;
  currentTool: 'select' | 'add-table';
  diagramName: string;
}

export interface DiagramActions {
  setNodes: (nodes: C4Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (position: { x: number; y: number }) => void;
  addNodeWithSize: (position: { x: number; y: number }, size: { width: number; height: number }) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  setSelectedElements: (elements: string[]) => void;
  setCurrentTool: (tool: 'select' | 'add-table') => void;
  setIsConnecting: (connecting: boolean) => void;
  setConnectionMode: (mode: boolean) => void;
  updateNodeData: (nodeId: string, data: Partial<C4NodeData>) => void;
  updateNodeSize: (nodeId: string, width: number, height: number) => void;
  updateNodeSizeAndPosition: (nodeId: string, width: number, height: number, deltaX?: number, deltaY?: number) => void;
  exportDiagram: () => void;
  setDiagramName: (name: string) => void;
  // Integration methods
  loadDiagramData: (nodes: C4Node[], edges: Edge[]) => void;
  getCurrentDiagramData: () => { nodes: C4Node[]; edges: Edge[] };
  clearDiagram: () => void;
}

export const useDiagramStore = create<DiagramState & DiagramActions>((set, get) => ({
  // Initial state
  nodes: [
    {
      id: 'sample-1',
      type: 'c4Node',
      position: { x: 150, y: 100 },
      data: {
        title: 'Sistema Web',
        description: 'Interface principal do usuário\nAcesso via navegador',
        type: 'system' as const,
        width: 180,
        height: 120
      }
    },
    {
      id: 'sample-2',
      type: 'c4Node',
      position: { x: 450, y: 100 },
      data: {
        title: 'API Gateway',
        description: 'Roteamento de requisições\nAutenticação e autorização',
        type: 'container' as const,
        width: 180,
        height: 120
      }
    },
    {
      id: 'sample-3',
      type: 'c4Node',
      position: { x: 300, y: 280 },
      data: {
        title: 'Banco de Dados',
        description: 'Armazenamento persistente\nPostgreSQL',
        type: 'component' as const,
        width: 180,
        height: 120
      }
    }
  ].map(node => ({ ...node, resizable: true } as any)),
  edges: [
    {
      id: 'e1-2',
      source: 'sample-1',
      target: 'sample-2',
      sourceHandle: 'right',
      targetHandle: 'left-target',
      type: 'smoothstep',
      animated: false, // Desabilitar animação para melhor performance
      style: { stroke: '#2196f3', strokeWidth: 3 }
    },
    {
      id: 'e2-3',
      source: 'sample-2',
      target: 'sample-3',
      sourceHandle: 'bottom',
      targetHandle: 'top-target',
      type: 'smoothstep',
      animated: false, // Desabilitar animação para melhor performance
      style: { stroke: '#2196f3', strokeWidth: 3 }
    }
  ],
  selectedElements: [],
  isConnecting: false,
  connectionMode: false,
  currentTool: 'select',
  diagramName: 'Novo Diagrama C4',

  // Actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as C4Node[]
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges)
    });
  },
  
  onConnect: (connection) => {
    const { source, target, sourceHandle, targetHandle } = connection;
    
    if (!source || !target) return;
    
    // Verificar se já existe uma conexão entre os mesmos nós
    const existingEdgeIndex = get().edges.findIndex(edge => 
      (edge.source === source && edge.target === target) ||
      (edge.source === target && edge.target === source)
    );
    
    const newEdge: Edge = {
      id: `e${source}-${target}-${Date.now()}`,
      source: source,
      target: target,
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
      type: 'smoothstep',
      animated: false, // Desabilitar animação para melhor performance
      style: { stroke: '#2196f3', strokeWidth: 3 }
    };
    
    let updatedEdges = get().edges;
    
    if (existingEdgeIndex !== -1) {
      // Substituir a conexão existente pela nova (novo posicionamento)
      updatedEdges = [
        ...updatedEdges.slice(0, existingEdgeIndex),
        newEdge,
        ...updatedEdges.slice(existingEdgeIndex + 1)
      ];
    } else {
      // Adicionar nova conexão
      updatedEdges = addEdge(newEdge, updatedEdges);
    }
    
    set({
      edges: updatedEdges,
      isConnecting: false,
      connectionMode: false
    });
  },
  
  addNode: (position) => {
    const id = `node-${Date.now()}`;
    const newNode: C4Node = {
      id,
      type: 'c4Node',
      position,
      data: {
        title: `Nova Tabela ${get().nodes.length + 1}`,
        description: 'Duplo clique para editar\nDescrição do componente',
        type: 'system',
        width: 180, // Dimensão padrão no data
        height: 120
      },
      style: {
        width: 180, // Também no style para consistência
        height: 120,
      }
    };
    
    // Adicionar propriedade resizable
    (newNode as any).resizable = true;
    
    set({
      nodes: [...get().nodes, newNode]
    });
  },

  addNodeWithSize: (position: { x: number; y: number }, size: { width: number; height: number }) => {
    const id = `node-${Date.now()}`;
    const minWidth = 180; // Tamanho mínimo definido
    const minHeight = 120;
    
    const finalWidth = Math.max(size.width, minWidth);
    const finalHeight = Math.max(size.height, minHeight);
    
    const newNode: C4Node = {
      id,
      type: 'c4Node',
      position,
      data: {
        title: `Nova Tabela ${get().nodes.length + 1}`,
        description: 'Duplo clique para editar\nDescrição do componente',
        type: 'system',
        width: finalWidth, // Dimensões no data
        height: finalHeight
      },
      style: {
        width: finalWidth, // Dimensões no style
        height: finalHeight,
      }
    };

    // Adicionar propriedade resizable
    (newNode as any).resizable = true;
    
    set({
      nodes: [...get().nodes, newNode]
    });
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
  
  setCurrentTool: (tool) => set({ 
    currentTool: tool,
    connectionMode: false,
    isConnecting: false 
  }),
  
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
  },  exportDiagram: () => {
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
  loadDiagramData: (nodes: C4Node[], edges: Edge[]) => {
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
