import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiagramManager } from '../stores/diagramManager';
import { useAuth } from '../hooks/useAuth.jsx';
import { useDiagramPermissions } from '../hooks/useDiagramPermissions.js';
import usersIcon from '../assets/users-icon.svg';
import './AccessManager.css';

const AccessManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { diagrams, deleteDiagram } = useDiagramManager();
  const { canCreateDiagrams, canManageAccess } = useDiagramPermissions();
  
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [projectUsers, setProjectUsers] = useState([]);
  const [projectClassifications, setProjectClassifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'classifications'

  // Mock de usuários disponíveis - em produção viria do backend
  const availableUsers = [
    { id: 1, name: 'João Silva', email: 'joao@empresa.com' },
    { id: 2, name: 'Maria Santos', email: 'maria@empresa.com' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@empresa.com' },
    { id: 4, name: 'Ana Paula', email: 'ana@empresa.com' },
    { id: 5, name: 'Carlos Oliveira', email: 'carlos@empresa.com' }
  ];

  const filteredUsers = availableUsers.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    !projectUsers.find(pu => pu.email === user.email)
  );

  // Carregar usuários do projeto quando selecionado
  useEffect(() => {
    if (selectedProject) {
      loadProjectUsers();
      loadProjectClassifications();
    }
  }, [selectedProject]);

  const loadProjectUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/diagrams/${selectedProject}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjectUsers(data.users || []);
      } else {
        console.error('Erro ao carregar usuários do projeto');
        setProjectUsers([]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setProjectUsers([]);
    }
    setLoading(false);
  };

  const loadProjectClassifications = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/diagrams/${selectedProject}/classifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjectClassifications(data.classifications || []);
      } else {
        console.error('Erro ao carregar classificações do projeto');
        setProjectClassifications([]);
      }
    } catch (error) {
      console.error('Erro ao carregar classificações:', error);
      setProjectClassifications([]);
    }
  };

  const addCollaborator = async (user, role = 'leitor') => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`http://localhost:3001/api/diagrams/${selectedProject}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: user.email,
          role: role
        })
      });

      if (response.ok) {
        setSearchTerm('');
        setShowSuggestions(false);
        loadProjectUsers(); // Recarregar lista
      } else {
        const error = await response.json();
        alert('Erro ao adicionar colaborador: ' + error.error);
      }
    } catch (error) {
      console.error('Erro ao adicionar colaborador:', error);
      alert('Erro ao adicionar colaborador');
    }
  };

  const removeCollaborator = async (userEmail) => {
    if (!selectedProject) return;

    if (confirm(`Tem certeza que deseja remover o acesso de ${userEmail}?`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/diagrams/${selectedProject}/users/${encodeURIComponent(userEmail)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          loadProjectUsers(); // Recarregar lista
        } else {
          const error = await response.json();
          alert('Erro ao remover colaborador: ' + error.error);
        }
      } catch (error) {
        console.error('Erro ao remover colaborador:', error);
        alert('Erro ao remover colaborador');
      }
    }
  };

  const updateUserRole = async (userEmail, newRole) => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`http://localhost:3001/api/diagrams/${selectedProject}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: userEmail,
          role: newRole
        })
      });

      if (response.ok) {
        loadProjectUsers(); // Recarregar lista
      } else {
        const error = await response.json();
        alert('Erro ao atualizar role: ' + error.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      alert('Erro ao atualizar role');
    }
  };

  const assignClassificationsToUser = async (userEmail, classificationIds) => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`http://localhost:3001/api/diagrams/${selectedProject}/users/${encodeURIComponent(userEmail)}/classifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          classificationIds: classificationIds
        })
      });

      if (response.ok) {
        loadProjectUsers(); // Recarregar lista
      } else {
        const error = await response.json();
        alert('Erro ao atribuir classificações: ' + error.error);
      }
    } catch (error) {
      console.error('Erro ao atribuir classificações:', error);
      alert('Erro ao atribuir classificações');
    }
  };

  const handleDeleteDiagram = async (diagramId) => {
    const diagram = diagrams.find(d => d.id === diagramId);
    if (!diagram) return;

    if (confirm(`Tem certeza que deseja excluir o diagrama "${diagram.name}"? Esta ação não pode ser desfeita.`)) {
      const result = await deleteDiagram(diagramId);
      if (result.success) {
        alert('Diagrama excluído com sucesso!');
        if (selectedProject === diagramId) {
          setSelectedProject('');
        }
      } else {
        alert('Erro ao excluir diagrama: ' + result.error);
      }
    }
  };

  // Verificar se o usuário pode acessar esta página
  if (!canManageAccess()) {
    return (
      <div className="access-manager-container">
        <div className="access-denied">
          <h2>🔒 Acesso Negado</h2>
          <p>Apenas administradores podem gerenciar acessos aos diagramas.</p>
          <button onClick={() => navigate('/')} className="btn-back">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }
    }
  };

  const getRoleName = (email) => {
    const role = projectRoles[email];
    if (role === 'owner') return 'Proprietário (controle total)';
    if (role === 'editor') return 'Editor (pode ver e comentar)';
    if (role === 'viewer') return 'Visualizador (pode ver)';
    return 'Editor (pode ver e comentar)'; // Default
  };

  const getRoleValue = (email) => {
    const role = projectRoles[email];
    if (role === 'owner') return 'owner';
    if (role === 'editor') return 'editor';
    if (role === 'viewer') return 'viewer';
    return 'editor'; // Default
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSearchBlur = () => {
    // Delay hiding to allow click on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="access-manager">
      <button className="back-button" onClick={() => navigate('/')}>
        Voltar ao Diagrama
      </button>

      <div className="header">
        <div className="header-icon">
          <img src={usersIcon} alt="Users" className="header-icon-image" />
        </div>
        <h1 className="header-title">Gerenciar Acesso</h1>
      </div>
      
      <div className="header-line"></div>

      <div className="section">
        <h2 className="section-title">Projeto</h2>
        <div className="dropdown-container">
          <select
            className="dropdown"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Selecione um projeto</option>
            {diagrams.map(diagram => (
              <option key={diagram.id} value={diagram.id}>
                {diagram.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Adicionar Pessoas</h2>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar usuário por nome ou email..."
            value={searchTerm}
            onChange={handleSearchChange}
            onBlur={handleSearchBlur}
            onFocus={() => searchTerm && setShowSuggestions(true)}
          />
          
          {showSuggestions && searchTerm && (
            <div className="suggestions-dropdown">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="suggestion-item"
                    onClick={() => addCollaborator(user)}
                  >
                    <div className="suggestion-name">{user.name}</div>
                    <div className="suggestion-email">{user.email}</div>
                  </div>
                ))
              ) : (
                <div className="suggestion-item loading">
                  {searchTerm ? 'Nenhum usuário disponível encontrado' : 'Digite para buscar usuários'}
                </div>
              )}
            </div>
          )}

          {/* Lista de membros atuais do projeto */}
          {selectedProject && projectMembers.length > 0 && (
            <div className="collaborators-list">
              <div className="collaborators-title">Pessoas com acesso ({projectMembers.length})</div>
              {projectMembers.map((email, index) => {
                // Buscar nome do usuário na lista disponível
                const user = availableUsers.find(u => u.email === email);
                const userName = user ? user.name : email.split('@')[0]; // Se não encontrar, usar parte do email
                
                return (
                  <div key={index} className="collaborator-item">
                    <div className="collaborator-info">
                      <div className="collaborator-name">{userName}</div>
                      <div className="collaborator-email">{email}</div>
                    </div>
                    <div className="access-control">
                      <select
                        className="access-dropdown"
                        value={getRoleValue(email)}
                        onChange={(e) => {
                          const roleMap = {
                            'viewer': 'viewer',
                            'editor': 'editor', 
                            'owner': 'owner'
                          };
                          updateAccess(email, roleMap[e.target.value]);
                        }}
                      >
                        <option value="viewer">Visualizador (pode ver)</option>
                        <option value="editor">Editor (pode ver e comentar)</option>
                        <option value="owner">Proprietário (controle total)</option>
                      </select>
                      {getRoleValue(email) !== 'owner' && (
                        <button
                          className="remove-btn"
                          onClick={() => removeCollaborator(email)}
                          title="Remover usuário"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mensagem quando projeto selecionado mas sem membros */}
          {selectedProject && projectMembers.length === 0 && (
            <div className="collaborators-list">
              <div className="collaborators-title">Pessoas com acesso (0)</div>
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#666',
                fontStyle: 'italic' 
              }}>
                Nenhum membro adicionado ainda. Use a busca acima para adicionar colaboradores.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessManager;
