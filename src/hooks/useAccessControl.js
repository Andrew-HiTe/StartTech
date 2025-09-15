import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar permissões de acesso do usuário
 * Controla quais tabelas são visíveis baseado nas classificações e permissões
 */
export const useAccessControl = (diagramId) => {
  const [permissions, setPermissions] = useState({});
  const [visibleTables, setVisibleTables] = useState(new Set());
  const [isOwner, setIsOwner] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar permissões do usuário para o diagrama
  const loadUserPermissions = useCallback(async () => {
    if (!diagramId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      console.log('🔐 useAccessControl loadUserPermissions:', { diagramId, hasToken: !!token });
      
      const response = await fetch(`http://localhost:3001/api/diagrams/${diagramId}/my-permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions);
        setVisibleTables(new Set(data.visibleTables));
        setIsOwner(data.isOwner);
        setHasAccess(data.hasAccess);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao carregar permissões');
        setHasAccess(false);
      }
    } catch (err) {
      setError('Erro de conexão ao verificar permissões');
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [diagramId]);

  // Verificar se usuário pode ver uma tabela específica
  const canViewTable = useCallback((tableNodeId, classificationId) => {
    // Se é dono do diagrama, pode ver tudo
    if (isOwner) return true;

    // Se não tem acesso ao diagrama, não pode ver nada
    if (!hasAccess) return false;

    // Se a tabela está na lista de visíveis explicitamente
    if (visibleTables.has(tableNodeId)) return true;

    // Verificar permissão por classificação
    if (classificationId && permissions[classificationId]) {
      return ['view', 'edit', 'admin'].includes(permissions[classificationId]);
    }

    // Padrão: se tem acesso ao diagrama mas não tem permissão específica,
    // pode ver apenas classificações padrão (será implementado pela API)
    return false;
  }, [isOwner, hasAccess, visibleTables, permissions]);

  // Verificar se usuário pode editar uma tabela
  const canEditTable = useCallback((tableNodeId, classificationId) => {
    // Se é dono do diagrama, pode editar tudo
    if (isOwner) return true;

    // Se não tem acesso ao diagrama, não pode editar nada
    if (!hasAccess) return false;

    // Verificar permissão de edição por classificação
    if (classificationId && permissions[classificationId]) {
      return ['edit', 'admin'].includes(permissions[classificationId]);
    }

    return false;
  }, [isOwner, hasAccess, permissions]);

  // Verificar se usuário pode administrar (configurar classificações)
  const canAdminister = useCallback(() => {
    return isOwner; // Apenas donos podem administrar por enquanto
  }, [isOwner]);

  // Filtrar nós visíveis baseado nas permissões
  const filterVisibleNodes = useCallback((nodes) => {
    if (!hasAccess && !isOwner) {
      return [];
    }

    if (isOwner) {
      return nodes; // Dono vê tudo
    }

    return nodes.filter(node => {
      // Para nós sem classificação ou com classificação padrão, mostrar
      if (!node.data.classificationId) {
        return true;
      }

      return canViewTable(node.id, node.data.classificationId);
    });
  }, [hasAccess, isOwner, canViewTable]);

  // Filtrar arestas visíveis (conexões entre tabelas visíveis)
  const filterVisibleEdges = useCallback((edges, visibleNodeIds) => {
    return edges.filter(edge => 
      visibleNodeIds.includes(edge.source) && 
      visibleNodeIds.includes(edge.target)
    );
  }, []);

  // Recarregar permissões quando diagrama mudar
  useEffect(() => {
    loadUserPermissions();
  }, [loadUserPermissions]);

  return {
    // Estados
    permissions,
    visibleTables,
    isOwner,
    hasAccess,
    loading,
    error,

    // Funções de verificação
    canViewTable,
    canEditTable,
    canAdminister,
    
    // Funções de filtragem
    filterVisibleNodes,
    filterVisibleEdges,
    
    // Função para recarregar
    refresh: loadUserPermissions
  };
};

/**
 * Hook para gerenciar classificações de um diagrama
 */
export const useClassifications = (diagramId) => {
  const [classifications, setClassifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadClassifications = useCallback(async () => {
    if (!diagramId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      console.log('🔐 useAccessControl loadClassifications:', { diagramId, hasToken: !!token });
      
      const response = await fetch(`http://localhost:3001/api/diagrams/${diagramId}/classifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClassifications(data.classifications);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao carregar classificações');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [diagramId]);

  // Obter classificação por ID
  const getClassificationById = useCallback((id) => {
    return classifications.find(c => c.id === id);
  }, [classifications]);

  // Obter classificação padrão
  const getDefaultClassification = useCallback(() => {
    return classifications.find(c => c.is_default) || classifications[0];
  }, [classifications]);

  // Recarregar quando diagrama mudar
  useEffect(() => {
    loadClassifications();
  }, [loadClassifications]);

  return {
    classifications,
    loading,
    error,
    getClassificationById,
    getDefaultClassification,
    refresh: loadClassifications
  };
};

export default { useAccessControl, useClassifications };