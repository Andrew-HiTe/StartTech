import React, { useState } from 'react';

const AccessManager = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedCollaborators, setAddedCollaborators] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const projects = [
    { value: '', label: 'Selecione um projeto' },
    { value: 'projeto1', label: 'Projeto Alpha' },
    { value: 'projeto2', label: 'Projeto Beta' },
    { value: 'projeto3', label: 'Projeto Gamma' },
    { value: 'projeto4', label: 'Projeto Delta' }
  ];

  const accessLevels = [
    { value: 'admin', label: 'Administrador' },
    { value: 'edicao', label: 'Edição' },
    { value: 'leitura', label: 'Leitura' }
  ];

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/access/search-collaborators?search=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSearchResults(data.collaborators || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erro ao buscar colaboradores:', error);
        setSearchResults([]);
      }
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCollaborator = (collaborator) => {
    // Verifica se já foi adicionado
    const existingCollab = addedCollaborators.find(collab => collab.email === collaborator.email);
    if (!existingCollab) {
      const newCollaborator = {
        name: collaborator.name || collaborator.email,
        email: collaborator.email,
        accessLevel: 'leitura'
      };
      setAddedCollaborators([...addedCollaborators, newCollaborator]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
    setSearchResults([]);
  };

  const handleAddCollaborator = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      e.preventDefault();
      
      // Verifica se é um email válido
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(searchTerm.trim())) {
        alert('Por favor, digite um email válido');
        return;
      }

      try {
        // Verifica se o email existe no banco
        const response = await fetch('/api/access/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: searchTerm.trim() }),
        });
        
        const data = await response.json();
        
        if (data.exists) {
          // Verifica se já foi adicionado
          const existingCollab = addedCollaborators.find(collab => collab.email === searchTerm.trim());
          if (!existingCollab) {
            const newCollaborator = {
              name: data.email, // Pode ser melhorado para buscar o nome real
              email: data.email,
              accessLevel: 'leitura'
            };
            setAddedCollaborators([...addedCollaborators, newCollaborator]);
            setSearchTerm('');
            setShowSuggestions(false);
          } else {
            alert('Colaborador já foi adicionado');
          }
        } else {
          alert('Email não encontrado no sistema. Apenas emails cadastrados podem ser adicionados.');
        }
      } catch (error) {
        console.error('Erro ao verificar email:', error);
        alert('Erro ao verificar email. Tente novamente.');
      }
    }
  };

  const handleRemoveCollaborator = (collaboratorToRemove) => {
    setAddedCollaborators(addedCollaborators.filter(collab => collab.email !== collaboratorToRemove));
  };

  const handleAccessLevelChange = (collaboratorEmail, newAccessLevel) => {
    setAddedCollaborators(addedCollaborators.map(collab => 
      collab.email === collaboratorEmail 
        ? { ...collab, accessLevel: newAccessLevel }
        : collab
    ));
  };

  const handleClickOutside = () => {
    setShowSuggestions(false);
  };

  return (
    <div className="access-manager">
      {/* Header com ícone e título */}
      <div className="header">
        <div className="header-icon">
          <img 
            src="/people.png" 
            alt="Ícone Gerenciador de Acessos" 
            className="header-icon-image"
          />
        </div>
        <h1 className="header-title">Gerenciador de Acessos</h1>
      </div>
      
      {/* Linha abaixo do header */}
      <div className="header-line"></div>

      {/* Seção Projeto */}
      <div className="section">
        <h2 className="section-title">Projeto:</h2>
        <div className="dropdown-container">
          <select 
            className="dropdown"
            value={selectedProject}
            onChange={handleProjectChange}
          >
            {projects.map((project) => (
              <option key={project.value} value={project.value}>
                {project.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Seção Buscador de Colaboradores */}
      <div className="section">
        <h2 className="section-title">Inserir colaboradores:</h2>
        <div className="search-container" onClick={handleClickOutside}>
          <input
            type="text"
            className="search-input"
            placeholder="Digite o email do colaborador e pressione Enter..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleAddCollaborator}
          />
          
          {/* Lista de sugestões */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="suggestions-dropdown">
              {isSearching && <div className="suggestion-item loading">Buscando...</div>}
              {!isSearching && searchResults.map((collaborator, index) => (
                <div 
                  key={index} 
                  className="suggestion-item"
                  onClick={() => handleSelectCollaborator(collaborator)}
                >
                  <div className="suggestion-name">{collaborator.name || collaborator.email}</div>
                  <div className="suggestion-email">{collaborator.email}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Lista de colaboradores adicionados */}
          {addedCollaborators.length > 0 && (
            <div className="collaborators-list">
              <h3 className="collaborators-title">Colaboradores Adicionados:</h3>
              {addedCollaborators.map((collaborator, index) => (
                <div key={index} className="collaborator-item">
                  <div className="collaborator-info">
                    <span className="collaborator-name">{collaborator.name}</span>
                    <span className="collaborator-email">{collaborator.email}</span>
                  </div>
                  
                  <div className="access-control">
                    <select 
                      className="access-dropdown"
                      value={collaborator.accessLevel}
                      onChange={(e) => handleAccessLevelChange(collaborator.email, e.target.value)}
                    >
                      {accessLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveCollaborator(collaborator.email)}
                      title="Remover colaborador"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessManager;