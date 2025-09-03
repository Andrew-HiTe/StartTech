import { useState } from 'react';
import { Modal } from './Modal';
import { useDiagramManager, formatTimeAgo, type Diagram } from '../stores/diagramManager';

// Importações de assets para Vite
import totvsLogo from '../assets/logo-totvs-azul-escuro.svg';
import totvsSymbol from '../assets/totvs-symbol.svg';
import diagramIcon from '../assets/diagram-icon.svg';
import lupaIcon from '../assets/lupa-1.svg';
import imageIcon from '../assets/image-9.svg';
import usersIcon from '../assets/users-icon.svg';

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
      <div className="p-4 border-b border-blue-400/30">
        {!isMinimized ? (
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              {/* Logo TOTVS */}
              <img 
                src={totvsLogo}
                alt="TOTVS Logo" 
                className="w-30 h-26 mb-2 filter brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.src = "/src/assets/logo-totvs-fallback.png";
                  e.currentTarget.className = "w-18 h-16 mb-2";
                }}
              />
              <h1 className="text-white font-extrabold text-xl" style={{ fontFamily: 'Nunito Sans, sans-serif' }}>
                T-Draw
              </h1>
            </div>
            {/* Botão X para fechar */}
            <button
              onClick={onToggle}
              className="text-white hover:bg-blue-600 p-1 rounded transition-colors"
              title="Fechar menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Símbolo TOTVS quando minimizado */}
            <img 
              src={totvsSymbol} 
              alt="TOTVS Symbol" 
              className="w-8 h-8 mb-2 filter brightness-0 invert"
            />
            {/* Botão menu hambúrguer quando minimizado */}
            <button
              onClick={onToggle}
              className="text-white hover:bg-blue-600 p-2 rounded transition-colors"
              title="Abrir menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo quando expandido */}
      {!isMinimized && (
        <>
          {/* Seção 1: Criar Diagrama */}
          <div className="p-4 border-b border-blue-400/30">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded flex items-center gap-3 transition-colors"
            >
              <img 
                src={diagramIcon} 
                alt="Diagrama" 
                className="w-7 h-7 filter brightness-0 invert"
              />
              <span className="font-medium">Criar Diagrama +</span>
            </button>
          </div>

          {/* Seção 2: Busca e Navegação */}
          <div className="p-4 border-b border-blue-400/30">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar diagramas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-blue-600 text-white placeholder-blue-200 p-2 rounded pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <img 
                src={lupaIcon} 
                alt="Buscar" 
                className="absolute left-2 top-2 w-6 h-6 filter brightness-0 invert"
              />
            </div>
            
            {/* Menu de navegação com ícones */}
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 p-2 text-blue-100 hover:bg-blue-600 hover:bg-opacity-50 rounded transition-colors">
                <img 
                  src={diagramIcon} 
                  alt="Diagramas" 
                  className="w-6 h-6 filter brightness-0 invert"
                />
                <span className="text-sm">Meus Diagramas</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-2 text-blue-100 hover:bg-blue-600 hover:bg-opacity-50 rounded transition-colors">
                <img 
                  src={imageIcon} 
                  alt="Pessoas" 
                  className="w-6 h-6 filter brightness-0 invert"
                />
                <span className="text-sm">Compartilhados</span>
              </button>
            </nav>
          </div>

          {/* Seção 3: Lista de Diagramas */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-white text-xs font-semibold mb-3 opacity-75">
                DIAGRAMAS RECENTES
              </h3>
              {getFilteredDiagrams().map((diagram) => (
                  <button
                    key={diagram.id}
                    onClick={() => selectDiagram(diagram.id)}
                    className={`w-full text-left p-3 rounded mb-2 transition-colors ${
                      currentDiagramId === diagram.id
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-100 hover:bg-blue-600 hover:bg-opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
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

          {/* Seção 4: Gerenciar Acessos */}
          <div className="p-4 border-t border-blue-400/30">
            <button 
              onClick={() => setIsAccessModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded flex items-center gap-3 transition-colors"
            >
              <img 
                src={usersIcon} 
                alt="Usuários" 
                className="w-5 h-5 filter brightness-0 invert"
              />
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
