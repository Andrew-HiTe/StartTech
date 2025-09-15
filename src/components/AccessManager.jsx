import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiagramManager } from '../stores/diagramManager';
import usersIcon from '../assets/users-icon.svg';
import './AccessManager.css';

const AccessManager = () => {
  const navigate = useNavigate();
  const { diagrams, addUserAccess, removeUserAccess, updateUserRole } = useDiagramManager();
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCollaborators, setNewCollaborators] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const availableUsers = [
    { id: 1, name: 'João Silva', email: 'joao@empresa.com' },
    { id: 2, name: 'Maria Santos', email: 'maria@empresa.com' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@empresa.com' },
    { id: 4, name: 'Ana Paula', email: 'ana@empresa.com' },
    { id: 5, name: 'Carlos Oliveira', email: 'carlos@empresa.com' }
  ];

  // Buscar projeto selecionado e seus membros
  const selectedDiagram = diagrams.find(d => d.id === selectedProject);
  const projectMembers = selectedDiagram?.shareSettings?.users || [];
  const projectRoles = selectedDiagram?.shareSettings?.roles || {};

  const filteredUsers = availableUsers.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    !projectMembers.includes(user.email) // Não mostrar usuários que já têm acesso
  );

  const addCollaborator = (user) => {
    if (selectedProject && !projectMembers.includes(user.email)) {
      addUserAccess(selectedProject, user.email);
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const removeCollaborator = (userEmail) => {
    if (selectedProject) {
      removeUserAccess(selectedProject, userEmail);
    }
  };

  const updateAccess = (userEmail, accessLevel) => {
    if (selectedProject && updateUserRole) {
      updateUserRole(selectedProject, userEmail, accessLevel);
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
