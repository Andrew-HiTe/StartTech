import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AccessManager = () => {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const projects = [
    { value: '', label: 'Selecione um projeto' },
    { value: 'projeto1', label: 'Projeto Alpha' },
    { value: 'projeto2', label: 'Projeto Beta' },
    { value: 'projeto3', label: 'Projeto Gamma' },
    { value: 'projeto4', label: 'Projeto Delta' }
  ];

  const handleBackToDiagram = () => {
    navigate('/diagram');
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={handleBackToDiagram}
          style={{
            marginRight: '20px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Voltar
        </button>
        
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '600', 
          color: '#333',
          margin: 0
        }}>
          🔐 Gerenciador de Acessos
        </h1>
      </div>

      {/* Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500',
            color: '#333'
          }}>
            Selecione o Projeto:
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            {projects.map((project) => (
              <option key={project.value} value={project.value}>
                {project.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500',
            color: '#333'
          }}>
            Buscar Colaborador:
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o email do colaborador..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ color: '#666', fontSize: '16px' }}>
            ✅ Página do Gerenciador de Acessos carregada com sucesso!
          </p>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
            Esta é uma versão simplificada baseada no projeto StartTech2.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessManager;
