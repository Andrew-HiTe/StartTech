import { create } from 'zustand';
import { listDiagrams, loadDiagram, saveDiagram, deleteDiagram } from '../services/diagramApi.js';

export const useDiagramManager = create((set, get) => ({
  // State - Inicia vazio, vai buscar do banco
  diagrams: [],
  currentDiagramId: null,
  searchTerm: '',
  isLoading: false,
  error: null,

  // Actions
  initializeDiagrams: async () => {
    console.log('🚀 [DiagramManager] Iniciando carregamento de diagramas...');
    set({ isLoading: true, error: null });
    try {
      const result = await listDiagrams();
      console.log('📦 [DiagramManager] Resposta da API:', result);
      
      if (result.success) {
        // Transformar dados do banco para o formato esperado
        const formattedDiagrams = result.diagrams.map(diagram => ({
          id: diagram.id ? diagram.id.toString() : 'unknown',
          name: diagram.name,
          type: 'c4', // Tipo padrão
          createdAt: new Date(diagram.created_at),
          lastModified: new Date(diagram.updated_at),
          isActive: true, // Só diagrams ativos vêm do banco
          nodes: [],
          edges: [],
          shareSettings: {
            users: ['admin@totvs.com'],
            roles: { 'admin@totvs.com': 'owner' },
            isPublic: false
          },
          version: diagram.version || 1
        }));

        set({ 
          diagrams: formattedDiagrams,
          isLoading: false,
          currentDiagramId: formattedDiagrams.length > 0 ? formattedDiagrams[0].id : null
        });
        
        console.log(`✅ [DiagramManager] ${formattedDiagrams.length} diagramas carregados do banco:`, formattedDiagrams.map(d => `${d.id}: ${d.name}`));
        return { success: true, diagrams: formattedDiagrams };
      } else {
        set({ isLoading: false, error: result.error });
        console.error('❌ [DiagramManager] Erro ao carregar diagramas:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      set({ isLoading: false, error: error.message });
      console.error('❌ [DiagramManager] Erro ao inicializar diagramas:', error);
      return { success: false, error: error.message };
    }
  },
  createDiagram: async (name, type) => {
    try {
      // Criar diagrama vazio no banco
      const result = await saveDiagram(name, { nodes: [], edges: [] });
      
      if (result.success && result.diagramId) {
        const newDiagram = {
          id: result.diagramId ? result.diagramId.toString() : 'temp-' + Date.now(),
          name,
          type: type || 'c4',
          createdAt: new Date(),
          lastModified: new Date(),
          isActive: true,
          nodes: [],
          edges: [],
          shareSettings: {
            users: ['admin@totvs.com'],
            roles: { 'admin@totvs.com': 'owner' },
            isPublic: false
          },
          version: 1
        };

        set((state) => ({
          diagrams: [newDiagram, ...state.diagrams.map(d => ({ ...d, isActive: false }))],
          currentDiagramId: newDiagram.id
        }));

        console.log(`✅ Diagrama "${name}" criado com ID: ${result.diagramId}`);
        return { success: true, diagramId: result.diagramId };
      } else {
        const error = result.error || 'ID do diagrama não retornado pelo servidor';
        console.error('❌ Erro ao criar diagrama:', error);
        return { success: false, error };
      }
    } catch (error) {
      console.error('❌ Erro ao criar diagrama:', error);
      return { success: false, error: error.message };
    }
  },

  deleteDiagram: async (id) => {
    try {
      const result = await deleteDiagram(parseInt(id));
      
      if (result.success) {
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
        
        console.log(`✅ Diagrama ID ${id} excluído com sucesso`);
        return { success: true };
      } else {
        console.error('❌ Erro ao excluir diagrama:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro ao excluir diagrama:', error);
      return { success: false, error: error.message };
    }
  },

  selectDiagram: async (id) => {
    try {
      // Carregar dados do diagrama do banco
      const result = await loadDiagram(parseInt(id));
      
      if (result.success) {
        // Atualizar estado local
        set((state) => ({
          diagrams: state.diagrams.map(d => ({ 
            ...d, 
            isActive: d.id === id,
            // Atualizar dados se necessário
            ...(d.id === id && result.diagram ? {
              nodes: result.diagram.data?.nodes || [],
              edges: result.diagram.data?.edges || [],
              lastModified: new Date(result.diagram.updated_at)
            } : {})
          })),
          currentDiagramId: id
        }));

        console.log(`✅ Diagrama "${result.diagram.name}" selecionado`);
        return { success: true, diagram: result.diagram };
      } else {
        console.error('❌ Erro ao selecionar diagrama:', result.error);
        // Fallback para seleção local
        set((state) => ({
          diagrams: state.diagrams.map(d => ({ ...d, isActive: d.id === id })),
          currentDiagramId: id
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar diagrama:', error);
      // Fallback para seleção local
      set((state) => ({
        diagrams: state.diagrams.map(d => ({ ...d, isActive: d.id === id })),
        currentDiagramId: id
      }));
      return { success: false, error: error.message };
    }
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

  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  getFilteredDiagrams: () => {
    const { diagrams, searchTerm } = get();
    console.log('🔍 [DiagramManager] getFilteredDiagrams chamado - Total diagramas:', diagrams.length, 'Busca:', searchTerm);
    
    if (!searchTerm) {
      console.log('📋 [DiagramManager] Retornando todos os diagramas:', diagrams.length);
      return diagrams;
    }
    
    const filtered = diagrams.filter(diagram =>
      diagram.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log('📋 [DiagramManager] Diagramas filtrados:', filtered.length);
    return filtered;
  },

  addUserAccess: (diagramId, userEmail, role = 'editor') => {
    set((state) => ({
      diagrams: state.diagrams.map(d =>
        d.id === diagramId
          ? {
              ...d,
              shareSettings: {
                ...d.shareSettings,
                users: [...d.shareSettings.users, userEmail],
                roles: {
                  ...d.shareSettings.roles,
                  [userEmail]: role
                }
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
                users: d.shareSettings.users.filter(u => u !== userEmail),
                roles: Object.fromEntries(
                  Object.entries(d.shareSettings.roles || {}).filter(([email]) => email !== userEmail)
                )
              },
              lastModified: new Date()
            }
          : d
      )
    }));
  },

  updateUserRole: (diagramId, userEmail, role) => {
    set((state) => ({
      diagrams: state.diagrams.map(d =>
        d.id === diagramId
          ? {
              ...d,
              shareSettings: {
                ...d.shareSettings,
                roles: {
                  ...d.shareSettings.roles,
                  [userEmail]: role
                }
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
