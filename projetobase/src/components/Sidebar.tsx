import React, { useState } from 'react';
import totvs_logo from '../assets/totvs-logo.svg';
import diagram_icon from '../assets/diagram-icon.svg';
import users_icon from '../assets/users-icon.svg';

interface SidebarProps {
  isMinimized: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMinimized, onToggle }) => {
  const [selectedDiagram, setSelectedDiagram] = useState<number | null>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');

  const diagrams = [
    { id: 1, name: 'Diagrama 1' },
    { id: 2, name: 'Diagrama 2' },
    { id: 3, name: 'Diagrama 3' },
    { id: 4, name: 'Diagrama 4' },
    { id: 5, name: 'Diagrama 5' },
  ];

  // Filtrar diagramas baseado na busca
  const filteredDiagrams = diagrams.filter(diagram =>
    diagram.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDiagram = () => {
    if (newDiagramName.trim()) {
      // Aqui você implementaria a lógica de criar o diagrama
      console.log('Criando diagrama:', newDiagramName);
      setNewDiagramName('');
      setShowCreateModal(false);
    }
  };

  return (
    <>
      <div 
        className={`transition-all duration-300 flex flex-col h-screen ${
          isMinimized ? 'w-16' : 'w-64'
        }`}
        style={{ backgroundColor: '#0457A7' }}
      >
        {/* Header com Logo */}
        <div className="p-4 border-b border-blue-400 border-opacity-30">
          <div className="flex items-center gap-3">
            <img src={totvs_logo} alt="TOTVS" className="w-8 h-8" />
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

        {!isMinimized && (
          <>
            {/* Botão Criar Diagrama */}
            <div className="p-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <img src={diagram_icon} alt="Diagrama" className="w-5 h-5 text-white" />
                <span className="font-medium">Criar Diagrama +</span>
              </button>
            </div>

            {/* Campo de Busca */}
            <div className="px-4 pb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nome diagrama"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-8 rounded-lg border border-gray-300 text-sm"
                />
                <div className="absolute left-2 top-2.5 text-gray-400">
                  🔍
                </div>
              </div>
            </div>

            {/* Lista de Diagramas */}
            <div className="flex-1 overflow-y-auto px-4">
              <div className="space-y-2">
                {filteredDiagrams.map((diagram) => (
                  <button
                    key={diagram.id}
                    onClick={() => setSelectedDiagram(diagram.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                      selectedDiagram === diagram.id
                        ? 'bg-blue-600 text-white'
                        : 'text-white hover:bg-blue-600 hover:bg-opacity-50'
                    }`}
                  >
                    <img src={diagram_icon} alt="Diagrama" className="w-5 h-5" />
                    <span className="font-medium">{diagram.name}</span>
                    <span className="ml-auto text-white opacity-50">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gerenciar Acessos */}
            <div className="p-4 border-t border-blue-400 border-opacity-30">
              <button
                onClick={() => setShowAccessModal(true)}
                className="w-full text-white hover:bg-blue-600 hover:bg-opacity-50 p-3 rounded-lg flex items-center gap-3 transition-colors"
              >
                <img src={users_icon} alt="Gerenciar" className="w-5 h-5" />
                <span className="font-medium">Gerenciar acessos</span>
                <span className="ml-auto opacity-50">→</span>
              </button>
            </div>
          </>
        )}

        {isMinimized && (
          <div className="flex-1 flex flex-col items-center py-4 gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-white hover:bg-blue-600 p-2 rounded transition-colors"
              title="Criar Diagrama"
            >
              <img src={diagram_icon} alt="Diagrama" className="w-6 h-6" />
            </button>
            <div className="border-t border-blue-400 border-opacity-30 w-8"></div>
            {filteredDiagrams.slice(0, 3).map((diagram) => (
              <button
                key={diagram.id}
                onClick={() => setSelectedDiagram(diagram.id)}
                className={`p-2 rounded transition-colors ${
                  selectedDiagram === diagram.id
                    ? 'bg-blue-600 text-white'
                    : 'text-white hover:bg-blue-600 hover:bg-opacity-50'
                }`}
                title={diagram.name}
              >
                <img src={diagram_icon} alt="Diagrama" className="w-5 h-5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar Diagrama */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h2 className="text-xl font-bold mb-4">Criar Novo Diagrama</h2>
            <input
              type="text"
              placeholder="Nome do diagrama"
              value={newDiagramName}
              onChange={(e) => setNewDiagramName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDiagram}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerenciar Acessos */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Gerenciar Acessos</h2>
              <button
                onClick={() => setShowAccessModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <p>Funcionalidade em desenvolvimento...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
