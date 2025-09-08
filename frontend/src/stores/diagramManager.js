import { create } from 'zustand';
import diagramService from '../services/diagramService.js';

const generateId = () => `diagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useDiagramManager = create((set, get) => ({
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
  isInitialized: false,

  // Inicializar diagramas mock no banco (desabilitado temporariamente para debug)
  initializeMockDiagrams: async () => {
    const { diagrams, isInitialized } = get();
    
    if (isInitialized) return;

    console.log('🔧 Inicialização de diagramas mock desabilitada para debug');
    set({ isInitialized: true });
    
    // Código de inicialização comentado temporariamente
    /*
    try {
      for (const diagram of diagrams) {
        await diagramService.createDiagramTable(diagram.id, diagram.name);
        console.log(`✅ Diagrama mock ${diagram.name} inicializado no banco`);
      }
      
      set({ isInitialized: true });
      console.log('✅ Todos os diagramas mock inicializados');
    } catch (error) {
      console.error('❌ Erro ao inicializar diagramas mock:', error);
    }
    */
  },

  // Actions
  createDiagram: async (name, type) => {
    const newId = generateId();
    const newDiagram = {
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

    try {
      // Criar tabela no banco de dados para o diagrama
      await diagramService.createDiagramTable(newId, name);
      
      set((state) => ({
        diagrams: [newDiagram, ...state.diagrams.map(d => ({ ...d, isActive: false }))],
        currentDiagramId: newId
      }));

      console.log(`✅ Diagrama "${name}" criado com sucesso e tabela no banco criada`);
      return newId;
    } catch (error) {
      console.error(`❌ Erro ao criar diagrama "${name}":`, error);
      // Criar diagrama localmente mesmo se falhar no banco
      set((state) => ({
        diagrams: [newDiagram, ...state.diagrams.map(d => ({ ...d, isActive: false }))],
        currentDiagramId: newId
      }));
      return newId;
    }
  },

  deleteDiagram: async (id) => {
    try {
      // Remover tabela do banco de dados
      await diagramService.deleteDiagramTable(id);
      
      set((state) => {
        const filtered = state.diagrams.filter(d => d.id !== id);
        const newCurrentId = state.currentDiagramId === id 
          ? (filtered.length > 0 ? filtered[0].id : null)
          : state.currentDiagramId;
        
        console.log(`✅ Diagrama ${id} e sua tabela no banco removidos com sucesso`);
        return {
          diagrams: filtered,
          currentDiagramId: newCurrentId
        };
      });
    } catch (error) {
      console.error(`❌ Erro ao remover diagrama ${id}:`, error);
      // Remover localmente mesmo se falhar no banco
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
    }
  },

  selectDiagram: (id) => {
    set((state) => ({
      diagrams: state.diagrams.map(d => ({ 
        ...d, 
        isActive: d.id === id,
        lastModified: d.id === id ? new Date() : d.lastModified
      })),
      currentDiagramId: id
    }));
  },

  updateDiagramName: (id, name) => {
    set((state) => ({
      diagrams: state.diagrams.map(d => 
        d.id === id 
          ? { ...d, name, lastModified: new Date() }
          : d
      )
    }));
  },

  setSearchTerm: (term) => set({ searchTerm: term }),

  getFilteredDiagrams: () => {
    const { diagrams, searchTerm } = get();
    return diagrams.filter(diagram =>
      diagram.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  addUserAccess: (diagramId, userEmail) => {
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

  removeUserAccess: (diagramId, userEmail) => {
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

  saveDiagramData: (diagramId, nodes, edges) => {
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

  updateDiagramActivity: (id) => {
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
export const formatTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return '1 dia atrás';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''} atrás`;
  return `${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''} atrás`;
};
