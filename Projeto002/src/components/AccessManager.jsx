/**
 * Gerenciador de Acessos - Página administrativa
 * Permite visualizar e gerenciar usuários com acesso aos diagramas
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiagramManager } from '../stores/diagramManager.js';

export const AccessManager = () => {
  const navigate = useNavigate();
  const { diagrams, addUserAccess, removeUserAccess } = useDiagramManager();
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleBackToDiagram = () => {
    navigate('/diagram');
  };

  const handleAddUser = (diagramId) => {
    if (newUserEmail.trim() && newUserEmail.includes('@')) {
      addUserAccess(diagramId, newUserEmail.trim());
      setNewUserEmail('');
    }
  };

  const handleRemoveUser = (diagramId, userEmail) => {
    removeUserAccess(diagramId, userEmail);
  };

  const filteredDiagrams = diagrams.filter(diagram => 
    diagram.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diagram.users.some(user => user.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDiagram}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>←</span>
                <span>Voltar ao Diagrama</span>
              </button>
              <div className="border-l border-gray-300 h-6"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                🔐 Gerenciador de Acessos
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {diagrams.length} diagrama(s) • {diagrams.reduce((total, d) => total + d.users.length, 0)} usuário(s)
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Busca */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por diagrama ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        {/* Lista de Diagramas */}
        <div className="space-y-6">
          {filteredDiagrams.map((diagram) => (
            <div key={diagram.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header do Diagrama */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{diagram.name}</h3>
                    <p className="text-sm text-gray-500">
                      Criado em {diagram.createdAt} • {diagram.users.length} usuário(s) com acesso
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      diagram.users.length > 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {diagram.users.length > 1 ? 'Compartilhado' : 'Privado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de Usuários */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {diagram.users.map((userEmail, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {userEmail.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{userEmail}</p>
                          <p className="text-xs text-gray-500">
                            {userEmail.includes('admin') ? 'Administrador' : 'Usuário'}
                          </p>
                        </div>
                      </div>
                      {diagram.users.length > 1 && !userEmail.includes('admin') && (
                        <button
                          onClick={() => handleRemoveUser(diagram.id, userEmail)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Adicionar Novo Usuário */}
                  <div className="flex items-center space-x-3 py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-400">+</span>
                    </div>
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="flex-1 border-0 bg-transparent text-sm focus:ring-0 focus:outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddUser(diagram.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddUser(diagram.id)}
                        disabled={!newUserEmail.trim() || !newUserEmail.includes('@')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDiagrams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum diagrama encontrado
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Tente ajustar sua busca' : 'Nenhum diagrama disponível'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
