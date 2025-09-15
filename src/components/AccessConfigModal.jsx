import React, { useState, useEffect } from 'react';

const AccessConfigModal = ({ isOpen, onClose, diagramId, diagramName }) => {
  const [activeTab, setActiveTab] = useState('classifications');
  const [classifications, setClassifications] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [diagramAccess, setDiagramAccess] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasEditAccess, setHasEditAccess] = useState(false);

  // Estados para formulários
  const [newClassification, setNewClassification] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isDefault: false
  });
  const [editingClassification, setEditingClassification] = useState(null);
  const [newPermission, setNewPermission] = useState({
    classificationId: '',
    userEmail: '',
    permissionType: 'view'
  });
  const [newDiagramAccess, setNewDiagramAccess] = useState({
    userEmail: '',
    accessLevel: 'view'
  });

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (isOpen && diagramId) {
      loadClassifications();
      loadDiagramAccess();
    }
  }, [isOpen, diagramId]);

  const loadClassifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/diagrams/${diagramId}/classifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClassifications(data.classifications);
        setHasEditAccess(data.hasEditAccess);
        
        // Carregar permissões para cada classificação
        for (const classification of data.classifications) {
          loadClassificationPermissions(classification.id);
        }
      } else {
        setError('Erro ao carregar classificações');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
    setLoading(false);
  };

  const loadClassificationPermissions = async (classificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/classifications/${classificationId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(prev => ({
          ...prev,
          [classificationId]: data.permissions
        }));
      }
    } catch (err) {
      console.error('Erro ao carregar permissões:', err);
    }
  };

  const loadDiagramAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/diagrams/${diagramId}/access`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDiagramAccess(data.accessList);
      }
    } catch (err) {
      console.error('Erro ao carregar acessos:', err);
    }
  };

  const createClassification = async () => {
    if (!newClassification.name.trim()) {
      setError('Nome da classificação é obrigatório');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/diagrams/${diagramId}/classifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newClassification)
      });

      if (response.ok) {
        setNewClassification({ name: '', description: '', color: '#3B82F6', isDefault: false });
        loadClassifications();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao criar classificação');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const updateClassification = async () => {
    if (!editingClassification.name.trim()) {
      setError('Nome da classificação é obrigatório');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/classifications/${editingClassification.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingClassification.name,
          description: editingClassification.description,
          color: editingClassification.color,
          isDefault: editingClassification.isDefault
        })
      });

      if (response.ok) {
        setEditingClassification(null);
        loadClassifications();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao atualizar classificação');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const deleteClassification = async (classificationId) => {
    if (!confirm('Tem certeza que deseja excluir esta classificação? As tabelas serão movidas para a classificação padrão.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/classifications/${classificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadClassifications();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao excluir classificação');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const addPermission = async () => {
    if (!newPermission.classificationId || !newPermission.userEmail.includes('@')) {
      setError('Selecione uma classificação e informe um e-mail válido');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/classifications/${newPermission.classificationId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: newPermission.userEmail,
          permissionType: newPermission.permissionType
        })
      });

      if (response.ok) {
        setNewPermission({ classificationId: '', userEmail: '', permissionType: 'view' });
        loadClassificationPermissions(newPermission.classificationId);
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao adicionar permissão');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const removePermission = async (classificationId, userEmail) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/classifications/${classificationId}/permissions/${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadClassificationPermissions(classificationId);
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao remover permissão');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const addDiagramAccess = async () => {
    if (!newDiagramAccess.userEmail.includes('@')) {
      setError('Informe um e-mail válido');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/diagrams/${diagramId}/access`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDiagramAccess)
      });

      if (response.ok) {
        setNewDiagramAccess({ userEmail: '', accessLevel: 'view' });
        loadDiagramAccess();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao conceder acesso');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configurar Acesso</h2>
            <p className="text-sm text-gray-600">Diagrama: {diagramName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'classifications'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('classifications')}
            >
              🏷️ Classificações
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'permissions'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('permissions')}
            >
              🔐 Permissões por Classificação
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'access'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('access')}
            >
              👥 Acesso ao Diagrama
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando...</span>
            </div>
          )}

          {/* Tab: Classificações */}
          {activeTab === 'classifications' && (
            <div className="space-y-6">
              {hasEditAccess && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">
                    {editingClassification ? 'Editar Classificação' : 'Nova Classificação'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome da classificação"
                      value={editingClassification ? editingClassification.name : newClassification.name}
                      onChange={(e) => {
                        if (editingClassification) {
                          setEditingClassification({...editingClassification, name: e.target.value});
                        } else {
                          setNewClassification({...newClassification, name: e.target.value});
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="color"
                      value={editingClassification ? editingClassification.color : newClassification.color}
                      onChange={(e) => {
                        if (editingClassification) {
                          setEditingClassification({...editingClassification, color: e.target.value});
                        } else {
                          setNewClassification({...newClassification, color: e.target.value});
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Descrição (opcional)"
                      value={editingClassification ? editingClassification.description : newClassification.description}
                      onChange={(e) => {
                        if (editingClassification) {
                          setEditingClassification({...editingClassification, description: e.target.value});
                        } else {
                          setNewClassification({...newClassification, description: e.target.value});
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingClassification ? editingClassification.isDefault : newClassification.isDefault}
                        onChange={(e) => {
                          if (editingClassification) {
                            setEditingClassification({...editingClassification, isDefault: e.target.checked});
                          } else {
                            setNewClassification({...newClassification, isDefault: e.target.checked});
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Classificação padrão</span>
                    </label>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={editingClassification ? updateClassification : createClassification}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {editingClassification ? 'Atualizar' : 'Criar'}
                    </button>
                    {editingClassification && (
                      <button
                        onClick={() => setEditingClassification(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-3">Classificações Existentes</h3>
                <div className="space-y-2">
                  {classifications.map((classification) => (
                    <div
                      key={classification.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: classification.color }}
                        ></div>
                        <div>
                          <span className="font-medium">{classification.name}</span>
                          {classification.is_default && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Padrão
                            </span>
                          )}
                          {classification.description && (
                            <p className="text-sm text-gray-600">{classification.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{classification.users_with_permission} usuários</span>
                        <span>•</span>
                        <span>{classification.tables_with_classification} tabelas</span>
                        {hasEditAccess && (
                          <div className="flex space-x-1 ml-4">
                            <button
                              onClick={() => setEditingClassification(classification)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ✏️
                            </button>
                            {!classification.is_default && (
                              <button
                                onClick={() => deleteClassification(classification.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Permissões por Classificação */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              {hasEditAccess && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Adicionar Permissão</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={newPermission.classificationId}
                      onChange={(e) => setNewPermission({...newPermission, classificationId: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma classificação</option>
                      {classifications.map((classification) => (
                        <option key={classification.id} value={classification.id}>
                          {classification.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="email"
                      placeholder="E-mail do usuário"
                      value={newPermission.userEmail}
                      onChange={(e) => setNewPermission({...newPermission, userEmail: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newPermission.permissionType}
                      onChange={(e) => setNewPermission({...newPermission, permissionType: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="view">Visualizar</option>
                      <option value="edit">Editar</option>
                      <option value="admin">Administrar</option>
                    </select>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={addPermission}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Adicionar Permissão
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {classifications.map((classification) => (
                  <div key={classification.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: classification.color }}
                      ></div>
                      <h4 className="font-medium">{classification.name}</h4>
                    </div>
                    
                    <div className="space-y-2">
                      {permissions[classification.id]?.length > 0 ? (
                        permissions[classification.id].map((permission) => (
                          <div
                            key={`${classification.id}-${permission.user_email}`}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <span className="font-medium">{permission.user_email}</span>
                              <span className="ml-2 text-sm text-gray-600">
                                ({permission.permission_type})
                              </span>
                            </div>
                            {hasEditAccess && (
                              <button
                                onClick={() => removePermission(classification.id, permission.user_email)}
                                className="text-red-600 hover:text-red-800"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Nenhuma permissão específica. Usuários com acesso ao diagrama podem ver conforme classificação padrão.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Acesso ao Diagrama */}
          {activeTab === 'access' && (
            <div className="space-y-6">
              {hasEditAccess && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Conceder Acesso ao Diagrama</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      placeholder="E-mail do usuário"
                      value={newDiagramAccess.userEmail}
                      onChange={(e) => setNewDiagramAccess({...newDiagramAccess, userEmail: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newDiagramAccess.accessLevel}
                      onChange={(e) => setNewDiagramAccess({...newDiagramAccess, accessLevel: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="view">Visualizar</option>
                      <option value="edit">Editar</option>
                      <option value="admin">Administrar</option>
                    </select>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={addDiagramAccess}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Conceder Acesso
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-3">Usuários com Acesso</h3>
                <div className="space-y-2">
                  {diagramAccess.map((access) => (
                    <div
                      key={access.user_email}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{access.user_email}</span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({access.access_level})
                        </span>
                        <div className="text-xs text-gray-500">
                          Concedido em: {new Date(access.granted_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {hasEditAccess && (
                        <button
                          onClick={() => {
                            // TODO: Implementar remoção de acesso
                            console.log('Remover acesso para:', access.user_email);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                  {diagramAccess.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      Nenhum usuário com acesso específico. Apenas o dono pode visualizar o diagrama.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessConfigModal;