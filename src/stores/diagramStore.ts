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
  currentTool: 'select' | 'add-table' | 'connect';
}

export interface DiagramActions {
  setNodes: (nodes: C4Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  setSelectedElements: (elements: string[]) => void;
  setCurrentTool: (tool: 'select' | 'add-table' | 'connect') => void;
  setIsConnecting: (connecting: boolean) => void;
  setConnectionMode: (mode: boolean) => void;
  updateNodeData: (nodeId: string, data: Partial<C4NodeData>) => void;
  exportDiagram: () => void;
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
        type: 'system'
      }
    },
    {
      id: 'sample-2',
      type: 'c4Node',
      position: { x: 450, y: 100 },
      data: {
        title: 'API Gateway',
        description: 'Roteamento de requisições\nAutenticação e autorização',
        type: 'container'
      }
    },
    {
      id: 'sample-3',
      type: 'c4Node',
      position: { x: 300, y: 280 },
      data: {
        title: 'Banco de Dados',
        description: 'Armazenamento persistente\nPostgreSQL',
        type: 'component'
      }
    }
  ],
  edges: [
    {
      id: 'e1-2',
      source: 'sample-1',
      target: 'sample-2',
      sourceHandle: 'right-source',
      targetHandle: 'left',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#2196f3', strokeWidth: 3 }
    },
    {
      id: 'e2-3',
      source: 'sample-2',
      target: 'sample-3',
      sourceHandle: 'bottom-source',
      targetHandle: 'top',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#2196f3', strokeWidth: 3 }
    }
  ],
  selectedElements: [],
  isConnecting: false,
  connectionMode: false,
  currentTool: 'select',

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
    const newEdge: Edge = {
      id: `e${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#2196f3', strokeWidth: 3 }
    };
    
    set({
      edges: addEdge(newEdge, get().edges),
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
        type: 'system'
      }
    };
    
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
    connectionMode: tool === 'connect',
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
  }
}));
