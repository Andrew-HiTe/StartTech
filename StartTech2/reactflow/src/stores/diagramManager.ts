import { create } from 'zustand';
import type { Edge } from '@xyflow/react';
import type { C4Node } from './diagramStore';

export interface Diagram {
  id: string;
  name: string;
  type: 'c4' | 'flowchart' | 'uml';
  createdAt: Date;
  lastModified: Date;
  isActive: boolean;
  nodes: C4Node[];
  edges: Edge[];
  shareSettings: {
    users: string[];
    isPublic: boolean;
  };
}

interface DiagramManagerState {
  diagrams: Diagram[];
  currentDiagramId: string | null;
  searchTerm: string;
}

interface DiagramManagerActions {
  // Diagram CRUD
  createDiagram: (name: string, type: Diagram['type']) => string;
  deleteDiagram: (id: string) => void;
  selectDiagram: (id: string) => void;
  updateDiagramName: (id: string, name: string) => void;
  
  // Search
  setSearchTerm: (term: string) => void;
  getFilteredDiagrams: () => Diagram[];
  
  // Access Management
  addUserAccess: (diagramId: string, userEmail: string) => void;
  removeUserAccess: (diagramId: string, userEmail: string) => void;
  
  // Diagram Data Management
  saveDiagramData: (diagramId: string, nodes: C4Node[], edges: Edge[]) => void;
  
  // Utils
  getCurrentDiagram: () => Diagram | null;
  updateDiagramActivity: (id: string) => void;
}

const generateId = () => `diagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useDiagramManager = create<DiagramManagerState & DiagramManagerActions>((set, get) => ({
  // Initial state with mock data
  diagrams: [
    {
      id: 'diagram_1',
      name: 'Sistema Principal',
      type: 'c4',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isActive: true,
      nodes: [],
      edges: [],
      shareSettings: {
        users: ['admin@totvs.com', 'user1@totvs.com'],
        isPublic: false
      }
    },
    {
      id: 'diagram_2',
      name: 'Módulo Financeiro',
      type: 'flowchart',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isActive: false,
      nodes: [],
      edges: [],
      shareSettings: {
        users: ['admin@totvs.com'],
        isPublic: false
      }
    },
    {
      id: 'diagram_3',
      name: 'Dashboard Analytics',
      type: 'uml',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isActive: false,
      nodes: [],
      edges: [],
      shareSettings: {
        users: ['admin@totvs.com', 'user2@totvs.com'],
        isPublic: true
      }
    }
  ],
  currentDiagramId: 'diagram_1',
  searchTerm: '',

  // Actions
  createDiagram: (name: string, type: Diagram['type']) => {
    const newId = generateId();
    const newDiagram: Diagram = {
      id: newId,
      name,
      type,
      createdAt: new Date(),
      lastModified: new Date(),
      isActive: true,
      nodes: [],
      edges: [],
      shareSettings: {
        users: ['admin@totvs.com'], // Current user
        isPublic: false
      }
    };

    set((state) => ({
      diagrams: [newDiagram, ...state.diagrams.map(d => ({ ...d, isActive: false }))],
      currentDiagramId: newId
    }));

    return newId;
  },

  deleteDiagram: (id: string) => {
    set((state) => {
      const filtered = state.diagrams.filter(d => d.id !== id);
      const newCurrentId = state.currentDiagramId === id 
        ? (filtered.length > 0 ? filtered[0].id : null)
        : state.currentDiagramId;
      
      return {
        diagrams: filtered,
        currentDiagramId: newCurrentId
      };
    });
  },

  selectDiagram: (id: string) => {
    set((state) => ({
      diagrams: state.diagrams.map(d => ({ 
        ...d, 
        isActive: d.id === id,
        lastModified: d.id === id ? new Date() : d.lastModified
      })),
      currentDiagramId: id
    }));
  },

  updateDiagramName: (id: string, name: string) => {
    set((state) => ({
      diagrams: state.diagrams.map(d => 
        d.id === id 
          ? { ...d, name, lastModified: new Date() }
          : d
      )
    }));
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
  },

  getFilteredDiagrams: () => {
    const { diagrams, searchTerm } = get();
    if (!searchTerm) return diagrams;
    
    return diagrams.filter(diagram =>
      diagram.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  addUserAccess: (diagramId: string, userEmail: string) => {
    set((state) => ({
      diagrams: state.diagrams.map(d =>
        d.id === diagramId
          ? {
              ...d,
              shareSettings: {
                ...d.shareSettings,
                users: [...d.shareSettings.users, userEmail]
              },
              lastModified: new Date()
            }
          : d
      )
    }));
  },

  removeUserAccess: (diagramId: string, userEmail: string) => {
    set((state) => ({
      diagrams: state.diagrams.map(d =>
        d.id === diagramId
          ? {
              ...d,
              shareSettings: {
                ...d.shareSettings,
                users: d.shareSettings.users.filter(u => u !== userEmail)
              },
              lastModified: new Date()
            }
          : d
      )
    }));
  },

  saveDiagramData: (diagramId: string, nodes: C4Node[], edges: Edge[]) => {
    set((state) => ({
      diagrams: state.diagrams.map(d =>
        d.id === diagramId
          ? {
              ...d,
              nodes,
              edges,
              lastModified: new Date()
            }
          : d
      )
    }));
  },

  getCurrentDiagram: () => {
    const { diagrams, currentDiagramId } = get();
    return diagrams.find(d => d.id === currentDiagramId) || null;
  },

  updateDiagramActivity: (id: string) => {
    set((state) => ({
      diagrams: state.diagrams.map(d =>
        d.id === id 
          ? { ...d, lastModified: new Date() }
          : d
      )
    }));
  }
}));

// Helper function to format time
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return '1 dia atrás';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''} atrás`;
  return `${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''} atrás`;
};
