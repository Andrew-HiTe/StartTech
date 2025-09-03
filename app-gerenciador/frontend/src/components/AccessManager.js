import React, { useState } from 'react';

const AccessManager = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const projects = [
    { value: '', label: 'Selecione um projeto' },
    { value: 'projeto1', label: 'Projeto Alpha' },
    { value: 'projeto2', label: 'Projeto Beta' },
    { value: 'projeto3', label: 'Projeto Gamma' },
    { value: 'projeto4', label: 'Projeto Delta' }
  ];

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Digite o nome do colaborador..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AccessManager;
