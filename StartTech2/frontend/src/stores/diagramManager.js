import { create } from 'zustand';
import diagramService from '../services/diagramService.js';

const generateId = () => `diagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useDiagramManager = create((set, get) => ({
  // Initial state - carregará do banco de dados
  diagrams: [],
  currentDiagramId: null,
  searchTerm: '',
  isLoading: false,
  error: null,
  isInitialized: false,

  // Carregar diagramas do banco de dados
  loadDiagramsFromDatabase: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('http://localhost:5000/api/diagrams/list');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.diagrams) {
        const formattedDiagrams = data.diagrams.map(diagram => ({
          id: diagram.id,
          name: diagram.name,
          type: 'table',
          tableName: diagram.table_name,
          createdAt: new Date(diagram.created_at),
          lastModified: new Date(diagram.updated_at),
          isActive: false,
          nodes: [],
          edges: [],
          shareSettings: {
            users: ['admin@totvs.com'],
            isPublic: false
          }
        }));
        
        set({ 
          diagrams: formattedDiagrams, 
          isLoading: false,
          isInitialized: true 
        });
        
        console.log(`✅ ${formattedDiagrams.length} diagramas carregados do banco de dados`);
      } else {
        set({ diagrams: [], isLoading: false, isInitialized: true });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar diagramas do banco:', error);
      set({ 
        error: error.message, 
        isLoading: false, 
        diagrams: [],
        isInitialized: true 
      });
    }
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
    
    // Sincronizar com sessionStorage para o componente principal
    sessionStorage.setItem('activeDiagramId', id);
    console.log(`🔄 Diagrama selecionado: ${id}`);
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
