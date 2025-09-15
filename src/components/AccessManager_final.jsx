/**
 * Gerenciador de Acessos - Página administrativa
 * Baseado no StartTech2 mas integrado com o sistema atual
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiagramManager } from '../stores/diagramManager.js';

export const AccessManager = () => {
  const navigate = useNavigate();
  const { diagrams, addUserAccess, removeUserAccess } = useDiagramManager();
  const [selectedProject, setSelectedProject] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  console.log('🔧 AccessManager carregado - versão funcional');
  console.log('📊 Diagramas disponíveis:', diagrams);

  const handleBackToDiagram = () => {
    navigate('/diagram');
  };

  const handleAddUser = () => {
    if (newUserEmail.trim() && newUserEmail.includes('@') && selectedProject) {
      addUserAccess(selectedProject, newUserEmail.trim());
      setNewUserEmail('');
      alert(`Usuário ${newUserEmail} adicionado ao projeto!`);
    } else {
      alert('Por favor, selecione um projeto e digite um email válido.');
    }
  };

  const handleRemoveUser = (diagramId, userEmail) => {
    removeUserAccess(diagramId, userEmail);
    alert(`Usuário ${userEmail} removido do projeto!`);
  };

  // Converter diagramas para formato de projetos
  const projects = [
    { value: '', label: 'Selecione um projeto' },
    ...diagrams.map(diagram => ({
      value: diagram.id,
      label: diagram.name
    }))
  ];

  const selectedDiagram = diagrams.find(d => d.id === selectedProject);
  const users = selectedDiagram?.shareSettings?.users || [];

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '900px', 
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
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          ← Voltar ao Diagrama
        </button>
        
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '600', 
          color: '#333',
          margin: 0
        }}>
          🔐 Gerenciador de Acessos
        </h1>
        
        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
          {diagrams.length} projeto(s) disponível(is)
        </div>
      </div>

      {/* Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        {/* Seleção de Projeto */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '600',
            color: '#333',
            fontSize: '16px'
          }}>
            📋 Selecione o Projeto:
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: '#fafbfc'
            }}
          >
            {projects.map((project) => (
              <option key={project.value} value={project.value}>
                {project.label}
              </option>
            ))}
          </select>
        </div>

        {/* Adicionar Colaborador */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '600',
            color: '#333',
            fontSize: '16px'
          }}>
            👥 Adicionar Colaborador:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Digite o email do colaborador..."
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #e1e5e9',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: '#fafbfc'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddUser();
                }
              }}
            />
            <button
              onClick={handleAddUser}
              disabled={!selectedProject || !newUserEmail.trim()}
              style={{
                padding: '12px 24px',
                backgroundColor: selectedProject && newUserEmail.trim() ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: selectedProject && newUserEmail.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Adicionar
            </button>
          </div>
        </div>

        {/* Lista de Usuários do Projeto Selecionado */}
        {selectedProject && (
          <div>
            <h3 style={{ 
              marginBottom: '15px', 
              color: '#333',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              👤 Usuários com Acesso ({users.length}):
            </h3>
            {users.length > 0 ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {users.map((userEmail, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#007bff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>
                          {userEmail.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', color: '#333' }}>
                          {userEmail}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {userEmail.includes('admin') ? 'Administrador' : 'Colaborador'}
                        </div>
                      </div>
                    </div>
                    {!userEmail.includes('admin') && (
                      <button
                        onClick={() => handleRemoveUser(selectedProject, userEmail)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ 
                color: '#6c757d', 
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '20px'
              }}>
                Nenhum usuário adicionado ainda.
              </p>
            )}
          </div>
        )}

        {!selectedProject && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ marginBottom: '8px' }}>Selecione um projeto</h3>
            <p>Escolha um projeto acima para gerenciar os acessos dos colaboradores.</p>
          </div>
        )}
      </div>

      {/* Footer de Status */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
        fontSize: '14px',
        color: '#28a745'
      }}>
        ✅ Sistema de Gerenciamento de Acessos funcionando corretamente!
      </div>
    </div>
  );
};
