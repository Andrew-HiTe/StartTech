/**
 * Serviço de API para gerenciar diagramas
 * Comunica com o backend para CRUD de diagramas
 */

const API_BASE_URL = 'http://localhost:3001/api';

// Função auxiliar para fazer requests autenticadas
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error(`❌ Erro na API (${endpoint}):`, error);
    throw error;
  }
}

// ====================================================
// FUNCÕES PÚBLICAS DA API
// ====================================================

/**
 * Lista todos os diagramas do usuário autenticado
 * @returns {Promise<Object>} Lista de diagramas
 */
export async function listDiagrams() {
  try {
    console.log('🔄 [API] Buscando diagramas do usuário...');
    const response = await apiRequest('/diagrams');
    console.log('📦 [API] Resposta do servidor:', response);
    
    const result = {
      success: true,
      diagrams: response.diagrams || []
    };
    
    console.log(`✅ [API] ${result.diagrams.length} diagramas encontrados`);
    return result;
  } catch (error) {
    console.error('❌ [API] Erro ao listar diagramas:', error);
    return {
      success: false,
      error: error.message,
      diagrams: []
    };
  }
}

/**
 * Carrega um diagrama específico pelo ID
 * @param {number} diagramId - ID do diagrama
 * @returns {Promise<Object>} Dados do diagrama
 */
export async function loadDiagram(diagramId) {
  try {
    const response = await apiRequest(`/diagrams/${diagramId}`);
    return {
      success: true,
      diagram: response.diagram
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      diagram: null
    };
  }
}

/**
 * Salva um novo diagrama
 * @param {string} name - Nome do diagrama
 * @param {Object} data - Dados do React Flow {nodes: [], edges: []}
 * @returns {Promise<Object>} Resultado do salvamento
 */
export async function saveDiagram(name, data) {
  try {
    // Validação básica
    if (!name || !name.trim()) {
      throw new Error('Nome do diagrama é obrigatório');
    }

    if (!data || !data.nodes || !data.edges) {
      throw new Error('Dados do diagrama inválidos');
    }

    const response = await apiRequest('/diagrams', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim(), data })
    });

    return {
      success: true,
      diagramId: response.id, // Backend retorna 'id', não 'diagramId'
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      diagramId: null
    };
  }
}

/**
 * Atualiza um diagrama existente
 * @param {number} diagramId - ID do diagrama
 * @param {string} name - Nome do diagrama
 * @param {Object} data - Dados do React Flow {nodes: [], edges: []}
 * @returns {Promise<Object>} Resultado da atualização
 */
export async function updateDiagram(diagramId, name, data) {
  try {
    // Validação básica
    if (!diagramId) {
      throw new Error('ID do diagrama é obrigatório');
    }

    if (!name || !name.trim()) {
      throw new Error('Nome do diagrama é obrigatório');
    }

    if (!data || !data.nodes || !data.edges) {
      throw new Error('Dados do diagrama inválidos');
    }

    const response = await apiRequest(`/diagrams/${diagramId}`, {
      method: 'PUT',
      body: JSON.stringify({ name: name.trim(), data })
    });

    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Exclui um diagrama (soft delete)
 * @param {number} diagramId - ID do diagrama
 * @returns {Promise<Object>} Resultado da exclusão
 */
export async function deleteDiagram(diagramId) {
  try {
    if (!diagramId) {
      throw new Error('ID do diagrama é obrigatório');
    }

    const response = await apiRequest(`/diagrams/${diagramId}`, {
      method: 'DELETE'
    });

    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Função auxiliar para extrair dados do React Flow
 * @param {Array} nodes - Nós do React Flow
 * @param {Array} edges - Conexões do React Flow
 * @returns {Object} Dados formatados para API
 */
export function formatDiagramData(nodes, edges) {
  return {
    nodes: nodes || [],
    edges: edges || [],
    metadata: {
      nodeCount: (nodes || []).length,
      edgeCount: (edges || []).length,
      lastModified: new Date().toISOString()
    }
  };
}

/**
 * Função auxiliar para validar dados do diagrama
 * @param {Object} data - Dados do diagrama
 * @returns {boolean} Se os dados são válidos
 */
export function validateDiagramData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    return false;
  }

  // Validação básica dos nós
  for (const node of data.nodes) {
    if (!node.id || !node.type || !node.position) {
      return false;
    }
  }

  // Validação básica das conexões
  for (const edge of data.edges) {
    if (!edge.id || !edge.source || !edge.target) {
      return false;
    }
  }

  return true;
}
