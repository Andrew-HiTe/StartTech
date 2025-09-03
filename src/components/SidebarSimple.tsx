import { useState } from 'react';
import { Modal } from './Modal';
import { useDiagramManager, formatTimeAgo, type Diagram } from '../stores/diagramManager';

interface SidebarProps {
  isMinimized: boolean;
  onToggle: () => void;
}

function Sidebar({ isMinimized, onToggle }: SidebarProps) {
  // Zustand store
  const {
    currentDiagramId,
    searchTerm,
    createDiagram,
    selectDiagram,
    setSearchTerm,
    getFilteredDiagrams,
    addUserAccess,
    removeUserAccess,
    getCurrentDiagram
  } = useDiagramManager();

  // Local state for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');
  const [newDiagramType, setNewDiagramType] = useState<Diagram['type']>('c4');
  const [newUserEmail, setNewUserEmail] = useState('');

  return (
    <div 
      className={`transition-all duration-300 flex flex-col h-screen ${
        isMinimized ? 'w-16' : 'w-64'
      }`}
      style={{ backgroundColor: '#0457A7' }}
    >
      {/* Header com Logo */}
      <div className="p-4 border-b border-blue-400 border-opacity-30">
        <div className="flex items-center gap-3">
          {/* Logo placeholder - sem SVG por enquanto */}
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-700 font-bold text-sm">T</span>
          </div>
          {!isMinimized && (
            <div className="flex-1">
              <h1 className="text-white font-extrabold text-xl" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                T-Draw
              </h1>
            </div>
          )}
          <button
            onClick={onToggle}
            className="text-white hover:bg-blue-600 p-1 rounded transition-colors"
          >
            {isMinimized ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Conteúdo quando expandido */}
      {!isMinimized && (
        <>
          {/* Botão Criar Diagrama */}
          <div className="p-4">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>📊</span>
              <span className="font-medium">Criar Diagrama +</span>
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="p-4 border-b border-blue-400 border-opacity-30">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar diagramas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-blue-600 text-white placeholder-blue-200 p-2 rounded-lg pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <span className="absolute left-2 top-2 text-blue-200">🔍</span>
            </div>
          </div>

          {/* Lista de Diagramas */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <h3 className="text-white text-xs font-semibold mb-2 px-2 opacity-75">
                DIAGRAMAS RECENTES
              </h3>
              {getFilteredDiagrams().map((diagram) => (
                  <button
                    key={diagram.id}
                    onClick={() => selectDiagram(diagram.id)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                      currentDiagramId === diagram.id
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-100 hover:bg-blue-600 hover:bg-opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        diagram.isActive ? 'bg-green-400' : 'bg-gray-400'
                      }`}></span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{diagram.name}</p>
                        <p className="text-xs opacity-75">{formatTimeAgo(diagram.lastModified)}</p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Botão Gerenciar Acessos */}
          <div className="p-4 border-t border-blue-400 border-opacity-30">
            <button 
              onClick={() => setIsAccessModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <span>👥</span>
              <span className="font-medium">Gerenciar Acessos</span>
            </button>
          </div>
        </>
      )}

      {/* Conteúdo quando minimizado */}
      {isMinimized && (
        <div className="flex-1 flex flex-col items-center py-4 gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-white hover:bg-blue-600 p-2 rounded transition-colors"
            title="Criar Diagrama"
          >
            <span className="text-xl">📊</span>
          </button>
        </div>
      )}

      {/* Modal Criar Diagrama */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Novo Diagrama"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Diagrama
            </label>
            <input
              type="text"
              value={newDiagramName}
              onChange={(e) => setNewDiagramName(e.target.value)}
              placeholder="Ex: Sistema de Vendas"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Diagrama
            </label>
            <select 
              value={newDiagramType}
              onChange={(e) => setNewDiagramType(e.target.value as Diagram['type'])}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="c4">Diagrama C4</option>
              <option value="flowchart">Fluxograma</option>
              <option value="uml">Diagrama UML</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewDiagramName('');
              }}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (newDiagramName.trim()) {
                  createDiagram(newDiagramName.trim(), newDiagramType);
                  setIsCreateModalOpen(false);
                  setNewDiagramName('');
                  setNewDiagramType('c4');
                }
              }}
              disabled={!newDiagramName.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Criar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Gerenciar Acessos */}
      <Modal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        title="Gerenciar Acessos"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar Usuário
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={() => {
                  if (newUserEmail.trim() && currentDiagramId) {
                    addUserAccess(currentDiagramId, newUserEmail.trim());
                    setNewUserEmail('');
                  }
                }}
                disabled={!newUserEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Adicionar
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Usuários com Acesso</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {getCurrentDiagram()?.shareSettings.users.map((email, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{email}</span>
                  <button 
                    onClick={() => {
                      if (currentDiagramId) {
                        removeUserAccess(currentDiagramId, email);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remover
                  </button>
                </div>
              )) || []}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setIsAccessModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export { Sidebar };
