import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import EditClassificationModal from './EditClassificationModal.jsx';

// Função auxiliar para fazer requisições autenticadas
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`http://localhost:3001${endpoint}`, config);
  return response;
};

const AccessConfigModal = ({ isOpen, onClose, diagramId, diagramName }) => {
  const [activeTab, setActiveTab] = useState('classifications');
  const [classifications, setClassifications] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [diagramAccess, setDiagramAccess] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasEditAccess, setHasEditAccess] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [classificationToEdit, setClassificationToEdit] = useState(null);

  // Controle de overflow do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Estados para formulários
  const [newClassification, setNewClassification] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isDefault: false
  });
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
      const response = await apiRequest(`/api/diagrams/${diagramId}/classifications`);

      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setClassifications(data);
          setHasEditAccess(true); 
        } else {
          setClassifications(data.classifications || []);
          setHasEditAccess(data.hasEditAccess || false);
        }
        
        const classificationsArray = Array.isArray(data) ? data : (data.classifications || []);
        for (const classification of classificationsArray) {
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
      const response = await apiRequest(`/api/classifications/${classificationId}/permissions`);

      if (response.ok) {
        const data = await response.json();
        setPermissions(prev => ({
          ...prev,
          [classificationId]: data.permissions
        }));
      }
    } catch (err) {
      console.log('Permissões não disponíveis para classificação:', classificationId);
      setPermissions(prev => ({
        ...prev,
        [classificationId]: []
      }));
    }
  };

  const loadDiagramAccess = async () => {
    try {
      const response = await apiRequest(`/api/diagrams/${diagramId}/access`);

      if (response.ok) {
        const data = await response.json();
        setDiagramAccess(data.accessList);
      }
    } catch (err) {
      console.error('Erro ao carregar acessos:', err);
    }
  };

  const createClassification = async () => {
    console.log('🚀 createClassification chamada');
    console.log('📝 newClassification:', newClassification);
    
    if (!newClassification.name.trim()) {
      console.log('❌ Nome da classificação está vazio');
      setError('Nome da classificação é obrigatório');
      return;
    }

    try {
      console.log('📡 Enviando requisição para criar classificação...');
      const response = await apiRequest(`/api/diagrams/${diagramId}/classifications`, {
        method: 'POST',
        body: JSON.stringify(newClassification)
      });

      console.log('📬 Resposta recebida:', response.status);

      if (response.ok) {
        console.log('✅ Classificação criada com sucesso');
        setNewClassification({ name: '', description: '', color: '#3B82F6', isDefault: false });
        loadClassifications();
        setError('');
      } else {
        const data = await response.json();
        console.log('❌ Erro na resposta:', data);
        setError(data.error || 'Erro ao criar classificação');
      }
    } catch (err) {
      console.log('❌ Erro de conexão:', err);
      setError('Erro de conexão');
    }
  };

  const updateClassification = async (classificationToUpdate) => {
    console.log('✏️ updateClassification chamada');
    console.log('📝 classificationToUpdate:', classificationToUpdate);
    
    if (!classificationToUpdate.name.trim()) {
      console.log('❌ Nome da classificação está vazio');
      setError('Nome da classificação é obrigatório');
      return;
    }

    try {
      console.log('📡 Enviando requisição para atualizar classificação...');
      const response = await apiRequest(`/api/classifications/${classificationToUpdate.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: classificationToUpdate.name,
          description: classificationToUpdate.description,
          color: classificationToUpdate.color,
          isDefault: classificationToUpdate.isDefault
        })
      });

      console.log('📬 Resposta recebida:', response.status);

      if (response.ok) {
        console.log('✅ Classificação atualizada com sucesso');
        setIsEditModalOpen(false);
        setClassificationToEdit(null);
        loadClassifications();
        setError('');
      } else {
        const data = await response.json();
        console.log('❌ Erro na resposta:', data);
        setError(data.error || 'Erro ao atualizar classificação');
      }
    } catch (err) {
      console.log('❌ Erro de conexão:', err);
      setError('Erro de conexão');
    }
  };

  const deleteClassification = async (classificationId) => {
    console.log('🗑️ deleteClassification chamada para ID:', classificationId);
    
    if (!confirm('Tem certeza que deseja excluir esta classificação? As tabelas serão movidas para a classificação padrão.')) {
      console.log('❌ Exclusão cancelada pelo usuário');
      return;
    }

    try {
      console.log('📡 Enviando requisição para deletar classificação...');
      console.log('🔗 Endpoint completo será:', `http://localhost:3001/api/classifications/${classificationId}`);
      const response = await apiRequest(`/api/classifications/${classificationId}`, {
        method: 'DELETE'
      });

      console.log('📬 Resposta recebida:', response.status);

      if (response.ok) {
        console.log('✅ Classificação deletada com sucesso');
        loadClassifications();
        setError('');
      } else {
        const data = await response.json();
        console.log('❌ Erro na resposta:', data);
        setError(data.error || 'Erro ao excluir classificação');
      }
    } catch (err) {
      console.log('❌ Erro de conexão:', err);
      setError('Erro de conexão');
    }
  };

  const addPermission = async () => {
    if (!newPermission.classificationId || !newPermission.userEmail.includes('@')) {
      setError('Selecione uma classificação e informe um e-mail válido');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
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
      const token = localStorage.getItem('authToken');
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
      const token = localStorage.getItem('authToken');
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

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999999,
    padding: '20px'
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    border: '1px solid #e5e7eb',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'hidden',
    position: 'relative',
    transform: 'translateZ(0)'
  };

  const modalContent = (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔐 Configurar Acesso</h2>
            <p className="text-sm text-gray-600 mt-1">Diagrama: <span className="font-medium">{diagramName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            title="Fechar modal"
          >
            <span className="text-3xl">×</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-2">
            <button
              className={`px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'classifications'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
              onClick={() => setActiveTab('classifications')}
            >
              🏷️ Classificações
            </button>
            <button
              className={`px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'permissions'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
              onClick={() => setActiveTab('permissions')}
            >
              🔐 Permissões por Classificação
            </button>
            <button
              className={`px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'access'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
              onClick={() => setActiveTab('access')}
            >
              👥 Acesso ao Diagrama
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="p-8 bg-gray-50 overflow-y-auto"
          style={{
            maxHeight: 'calc(90vh - 160px)'
          }}
        >
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando...</span>
              <span className="ml-2">Carregando...</span>
            </div>
          )}

          {/* Tab: Classificações */}
          {activeTab === 'classifications' && (
            <div className="space-y-8">
              {hasEditAccess && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    {'➕ Nova Classificação'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      placeholder="Nome da classificação"
                      value={newClassification.name}
                      onChange={(e) => setNewClassification({ ...newClassification, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="color"
                      value={newClassification.color}
                      onChange={(e) => setNewClassification({ ...newClassification, color: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Descrição (opcional)"
                      value={newClassification.description}
                      onChange={(e) => setNewClassification({ ...newClassification, description: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newClassification.isDefault}
                        onChange={(e) => setNewClassification({ ...newClassification, isDefault: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Classificação padrão</span>
                    </label>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={createClassification}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {'Criar'}
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">📋 Classificações Existentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classifications?.map((classification) => (
                    <div
                      key={classification.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className="w-6 h-6 rounded-full shadow-sm"
                          style={{ backgroundColor: classification.color }}
                        ></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{classification.name}</h4>
                          {classification.description && (
                            <p className="text-sm text-gray-600 mt-1">{classification.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          {classification.isDefault && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              ⭐ Padrão
                            </span>
                          )}
                        </div>
                        
                        {hasEditAccess && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                console.log('🖱️ Botão editar clicado para classificação:', classification);
                                setClassificationToEdit(classification);
                                setIsEditModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => {
                                console.log('🖱️ Botão deletar clicado para classificação ID:', classification.id);
                                console.log('📋 Classificação completa:', classification);
                                deleteClassification(classification.id);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              🗑️ Excluir
                            </button>
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
                      {classifications?.map((classification) => (
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
                {classifications?.map((classification) => (
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
                  {diagramAccess?.map((access) => (
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
        <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            💡 Configure classificações e permissões para controlar o acesso aos dados do diagrama
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
          >
            ✅ Concluído
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      {modalContent}
      <EditClassificationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        classification={classificationToEdit}
        onSave={updateClassification}
      />
    </>,
    document.body
  );
};

export default AccessConfigModal;
