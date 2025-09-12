import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal.jsx';
import { useDiagramManager } from '../stores/diagramManager.js';
import { useDiagramStore } from '../stores/diagramStore.js';

// Importações de assets para Vite
import homelogo from '../assets/images/homelogo.png';
import homelogoSimbolo from '../assets/images/homelogo-simbolo.png';
import totvsSymbol from '../assets/totvs-symbol.svg';
import diagramIcon from '../assets/diagram-icon.svg';
import lupaIcon from '../assets/lupa-1.svg';

function Sidebar({ isMinimized, onToggle }) {
  const navigate = useNavigate();
  
  // Zustand stores
  const {
    currentDiagramId,
    searchTerm,
    createDiagram,
    selectDiagram,
    setSearchTerm,
    getFilteredDiagrams,
    initializeDiagrams,
    isLoading,
    error
  } = useDiagramManager();

  const {
    loadDiagramFromDB,
    loadAvailableDiagrams
  } = useDiagramStore();

  // Local state for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');
  const [newDiagramType, setNewDiagramType] = useState('c4');

  // Inicializar diagramas ao montar o componente
  useEffect(() => {
    console.log('🔄 Inicializando diagramas do banco...');
    initializeDiagrams();
    loadAvailableDiagrams();
  }, [initializeDiagrams, loadAvailableDiagrams]);

  // Handler para selecionar diagrama com integração
  const handleSelectDiagram = async (diagramId) => {
    console.log(`🔄 Selecionando diagrama ID: ${diagramId}`);
    
    // Selecionar no diagramManager
    const managerResult = await selectDiagram(diagramId);
    
    // Carregar no diagramStore
    const storeResult = await loadDiagramFromDB(parseInt(diagramId));
    
    if (managerResult.success && storeResult.success) {
      console.log(`✅ Diagrama "${storeResult.diagram.name}" carregado com sucesso`);
    } else {
      console.error('❌ Erro ao carregar diagrama:', managerResult.error || storeResult.error);
    }
  };

  // Handler para criar novo diagrama com integração completa
  const handleCreateDiagram = async (name, type = 'c4') => {
    if (!name.trim()) return;
    
    try {
      console.log(`🔄 Criando diagrama: "${name}"`);
      
      // Criar no diagramManager
      const managerResult = await createDiagram(name.trim(), type);
      
      if (managerResult.success) {
        // Carregar no diagramStore para que o usuário possa começar a editar
        const storeResult = await loadDiagramFromDB(managerResult.diagramId);
        
        if (storeResult.success) {
          console.log(`✅ Diagrama "${name}" criado e carregado com sucesso`);
          
          // Fechar modal e limpar form
          setIsCreateModalOpen(false);
          setNewDiagramName('');
          setNewDiagramType('c4');
          
          // Recarregar lista para mostrar o novo diagrama
          await initializeDiagrams();
        } else {
          console.error('❌ Erro ao carregar diagrama recém-criado:', storeResult.error);
        }
      } else {
        console.error('❌ Erro ao criar diagrama:', managerResult.error);
        alert(`Erro ao criar diagrama: ${managerResult.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao criar diagrama:', error);
      alert(`Erro ao criar diagrama: ${error.message}`);
    }
  };

  return (
    <div 
      className={`transition-all duration-300 flex flex-col h-screen ${
        isMinimized ? 'w-16' : 'w-64'
      }`}
      style={{ backgroundColor: '#eaf9ff' }}
    >
      {/* Header com Logo */}
      <div className="p-4 border-b" style={{ borderColor: '#d1ecf1' }}>
        {!isMinimized ? (
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <img 
                src={homelogo}
                alt="Logo" 
                className="w-30 h-20 mb-2"
                onError={(e) => {
                  e.currentTarget.src = "/src/assets/logo-totvs-fallback.png";
                  e.currentTarget.className = "w-14 h-14 mb-2";
                }}
              />
            </div>
            <button
              onClick={onToggle}
              className="hover:bg-blue-100 p-1 rounded transition-colors"
              style={{ color: '#022b3a' }}
              title="Fechar menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img 
              src={homelogoSimbolo} 
              alt="Logo Symbol" 
              className="w-8 h-8 mb-2"
            />
            <button
              onClick={onToggle}
              className="hover:bg-blue-100 p-2 rounded transition-colors"
              style={{ color: '#022b3a' }}
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
          <div className="p-4 border-b" style={{ borderColor: '#d1ecf1' }}>
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

          {/* Seção 2: Busca */}
          <div className="p-4 border-b" style={{ borderColor: '#d1ecf1' }}>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar diagramas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-2 p-2 rounded pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                style={{ 
                  color: '#022b3a', 
                  borderColor: '#d1ecf1',
                  backgroundColor: '#ffffff'
                }}
              />
              <img 
                src={lupaIcon} 
                alt="Buscar" 
                className="absolute left-2 top-2 w-6 h-6"
                style={{ filter: 'brightness(0) saturate(100%)', color: '#022b3a' }}
              />
            </div>
          </div>

          {/* Seção 3: Lista de Diagramas */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-xs font-semibold mb-3 opacity-75" style={{ color: '#022b3a' }}>
                DIAGRAMAS RECENTES
              </h3>
              
              {isLoading ? (
                <div className="text-sm p-3 text-center" style={{ color: '#022b3a' }}>
                  🔄 Carregando diagramas...
                </div>
              ) : error ? (
                <div className="text-red-600 text-sm p-3 text-center">
                  ❌ Erro: {error}
                </div>
              ) : getFilteredDiagrams().length === 0 ? (
                <div className="text-sm p-3 text-center opacity-75" style={{ color: '#022b3a' }}>
                  📝 Nenhum diagrama encontrado
                </div>
              ) : (
                getFilteredDiagrams().map((diagram) => (
                  <button
                    key={diagram.id}
                    onClick={() => handleSelectDiagram(diagram.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors mb-2 ${
                      diagram.isActive 
                        ? 'border-2' 
                        : 'hover:bg-blue-50'
                    }`}
                    style={{ 
                      backgroundColor: diagram.isActive ? '#d1ecf1' : '#ffffff',
                      borderColor: diagram.isActive ? '#022b3a' : '#d1ecf1',
                      border: diagram.isActive ? '2px solid #022b3a' : '1px solid #d1ecf1'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate" style={{ color: '#022b3a' }}>
                          {diagram.name}
                        </h4>
                        <p className="text-xs opacity-75 flex items-center gap-1" style={{ color: '#022b3a' }}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {diagram.lastModified ? new Date(diagram.lastModified).toLocaleDateString('pt-BR') : 'Novo'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newDiagramName.trim()) {
                  handleCreateDiagram(newDiagramName.trim(), newDiagramType);
                } else if (e.key === 'Escape') {
                  setIsCreateModalOpen(false);
                  setNewDiagramName('');
                }
              }}
              placeholder="Ex: Sistema de Vendas"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
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
                  handleCreateDiagram(newDiagramName.trim(), newDiagramType);
                }
              }}
              disabled={!newDiagramName.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Criar Diagrama
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export { Sidebar };
