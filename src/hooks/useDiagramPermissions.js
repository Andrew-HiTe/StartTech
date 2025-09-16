/**
 * Hook para gerenciar permissões por diagrama
 * Controla roles: admin (gestor), editor, leitor
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth.jsx';

const DiagramPermissionsContext = createContext();

export const DiagramPermissionsProvider = ({ children }) => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(false);

  // Verificar permissões do usuário para um diagrama específico
  const getUserDiagramRole = async (diagramId) => {
    if (!user?.email || !diagramId) return null;

    try {
      const response = await fetch(`http://localhost:3001/api/diagrams/${diagramId}/user-role`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.role || null;
      }
      return null;
    } catch (error) {
      console.error('Erro ao verificar role do usuário:', error);
      return null;
    }
  };

  // Verificar se usuário pode ver um diagrama
  const canViewDiagram = (diagramId) => {
    if (!user?.email) return false;
    
    // Admin global sempre pode ver tudo
    if (user.role === 'admin') return true;
    
    const permissions = userPermissions[diagramId];
    return permissions && ['admin', 'editor', 'leitor'].includes(permissions.role);
  };

  // Verificar se usuário pode editar um diagrama
  const canEditDiagram = (diagramId) => {
    if (!user?.email) return false;
    
    // Admin global sempre pode editar
    if (user.role === 'admin') return true;
    
    const permissions = userPermissions[diagramId];
    return permissions && ['admin', 'editor'].includes(permissions.role);
  };

  // Verificar se usuário pode gerenciar acesso (adicionar/remover usuários)
  const canManageAccess = (diagramId) => {
    if (!user?.email) return false;
    
    // Apenas admin global pode gerenciar acessos
    return user.role === 'admin';
  };

  // Verificar se usuário pode ver configurações de tabelas
  const canViewTableConfig = (diagramId) => {
    if (!user?.email) return false;
    
    // Admin global sempre pode ver
    if (user.role === 'admin') return true;
    
    const permissions = userPermissions[diagramId];
    return permissions && ['admin', 'editor'].includes(permissions.role);
  };

  // Verificar se usuário pode criar/excluir diagramas
  const canCreateDiagrams = () => {
    return user?.role === 'admin';
  };

  // Verificar se usuário pode ver uma tabela específica baseado nas tags
  const canViewTable = (diagramId, tableClassifications = []) => {
    if (!user?.email) return false;
    
    // Admin global sempre pode ver tudo
    if (user.role === 'admin') return true;
    
    const permissions = userPermissions[diagramId];
    if (!permissions) return false;

    // Editor pode ver todas as tabelas
    if (permissions.role === 'editor') return true;
    
    // Leitor só pode ver tabelas com suas classificações
    if (permissions.role === 'leitor') {
      if (!tableClassifications.length) return false; // Tabela sem classificação = invisível para leitor
      
      // Verificar se o usuário tem permissão para pelo menos uma classificação da tabela
      return tableClassifications.some(classification => 
        permissions.allowedClassifications?.includes(classification.id)
      );
    }

    return false;
  };

  // Carregar permissões do usuário para todos os diagramas
  const loadUserPermissions = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/user/diagram-permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.permissions || {});
      }
    } catch (error) {
      console.error('Erro ao carregar permissões do usuário:', error);
    }
    setLoading(false);
  };

  // Recarregar permissões quando usuário mudar
  useEffect(() => {
    loadUserPermissions();
  }, [user?.email]);

  const value = {
    userPermissions,
    loading,
    getUserDiagramRole,
    canViewDiagram,
    canEditDiagram,
    canManageAccess,
    canViewTableConfig,
    canCreateDiagrams,
    canViewTable,
    loadUserPermissions
  };

  return (
    <DiagramPermissionsContext.Provider value={value}>
      {children}
    </DiagramPermissionsContext.Provider>
  );
};

// Hook para usar o contexto
export const useDiagramPermissions = () => {
  const context = useContext(DiagramPermissionsContext);
  
  if (!context) {
    throw new Error('useDiagramPermissions deve ser usado dentro de DiagramPermissionsProvider');
  }
  
  return context;
};