import React, { useState, useEffect, useCallback } from 'react';
import { useDiagramStore } from '../stores/diagramStore.js';
import AccessConfigModal from './AccessConfigModal.jsx';

export const Toolbar = ({ onCenterView }) => {
  const { 
    currentTool, 
    setCurrentTool, 
    selectedElements, 
    deleteNode, 
    deleteEdge,
    nodes,
    edges,
    exportDiagram,
    diagramName,
    saveDiagramToDB,
    isDirty,
    autoSaveEnabled,
    currentDiagramId,
    markDirty
  } = useDiagramStore();

  // Estado para feedback visual do auto-save
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'dirty'
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  
  // Estado para modal de configuração de acesso
  const [showAccessConfig, setShowAccessConfig] = useState(false);

  console.log('🔧 Toolbar renderizado, currentTool:', currentTool);

  // Auto-save implementation
  const performAutoSave = useCallback(async () => {
    if (!autoSaveEnabled || !isDirty || !currentDiagramId || !diagramName) {
      return;
    }

    setSaveStatus('saving');
    console.log('🔄 Auto-save iniciando...');
    
    try {
      const result = await saveDiagramToDB(diagramName);
      if (result.success) {
        setSaveStatus('saved');
        console.log('✅ Auto-save concluído');
      } else {
        setSaveStatus('dirty');
        console.error('❌ Erro no auto-save:', result.error);
      }
    } catch (error) {
      setSaveStatus('dirty');
      console.error('❌ Erro no auto-save:', error);
    }
  }, [autoSaveEnabled, isDirty, currentDiagramId, diagramName, saveDiagramToDB]);

  // Configurar auto-save com debounce
  useEffect(() => {
    if (isDirty && autoSaveEnabled) {
      setSaveStatus('dirty');
      
      // Limpar timer anterior
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // Configurar novo timer para auto-save após 3 segundos
      const timer = setTimeout(() => {
        performAutoSave();
      }, 3000);
      
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [isDirty, autoSaveEnabled, performAutoSave]);

  // Limpar timer quando componente desmonta
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, []);

  const handleDelete = () => {
    selectedElements.forEach(elementId => {
      // Check if it's a node or edge
      const isNode = nodes.some(node => node.id === elementId);
      const isEdge = edges.some(edge => edge.id === elementId);
      
      if (isNode) {
        deleteNode(elementId);
      } else if (isEdge) {
        deleteEdge(elementId);
      }
    });
    
    // Marcar como dirty após deletar elementos
    markDirty();
  };

  const handleManualSave = async () => {
    if (!currentDiagramId || !diagramName) {
      console.log('❌ Não é possível salvar: diagrama não inicializado');
      return;
    }

    setSaveStatus('saving');
    try {
      const result = await saveDiagramToDB(diagramName);
      if (result.success) {
        setSaveStatus('saved');
        console.log('✅ Salvamento manual concluído');
      } else {
        setSaveStatus('dirty');
        console.error('❌ Erro no salvamento manual:', result.error);
      }
    } catch (error) {
      setSaveStatus('dirty');
      console.error('❌ Erro no salvamento manual:', error);
    }
  };

  const toolButtons = [
    {
      id: 'select',
      label: 'Selecionar',
      icon: '🖱️',
      active: currentTool === 'select',
      description: 'Selecionar, mover e conectar elementos (clique neste botão para conectar nós)'
    },
    {
      id: 'add-table',
      label: 'Adicionar Tabela',
      icon: '📊',
      active: currentTool === 'add-table',
      description: 'Clique ou arraste no canvas para adicionar nova tabela'
    }
  ];

  return (
    <div className="toolbar bg-white border-b border-gray-300 p-2 flex items-center justify-between shadow-sm min-h-[3rem] overflow-x-auto">
      <div className="flex items-center space-x-2 flex-shrink-0">
        {toolButtons.map(tool => (
          <button
            key={tool.id}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 whitespace-nowrap flex-shrink-0 ${
              tool.active 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={(e) => {
              console.log('🖱️ BOTÃO DA TOOLBAR CLICADO!', {
                toolId: tool.id,
                toolAnterior: currentTool,
                novoTool: tool.id,
                event: e,
                target: e.target,
                currentTarget: e.currentTarget
              });
              
              // Verificar se setCurrentTool existe
              if (typeof setCurrentTool === 'function') {
                console.log('✅ setCurrentTool é uma função, chamando...');
                setCurrentTool(tool.id);
                console.log('✅ setCurrentTool executado para:', tool.id);
              } else {
                console.error('❌ setCurrentTool não é uma função!', typeof setCurrentTool);
              }
            }}
            title={tool.description}
          >
            <span className="mr-1">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
        
        {selectedElements.length > 0 && (
          <button
            className="px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-150 whitespace-nowrap flex-shrink-0"
            onClick={handleDelete}
            title="Excluir elementos selecionados"
          >
            <span className="mr-1">🗑️</span>
            Excluir ({selectedElements.length})
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* Botão para centralizar visualização */}
        {onCenterView && (
          <button
            className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-150 whitespace-nowrap flex-shrink-0"
            onClick={onCenterView}
            title="Centralizar visualização nos nós"
          >
            <span className="mr-1">🎯</span>
            Centralizar
          </button>
        )}
        
        {/* Manual save button (only when auto-save is off) */}
        {!autoSaveEnabled && (
          <button
            onClick={handleManualSave}
            disabled={!isDirty || saveStatus === 'saving'}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
          >
            💾 Salvar
          </button>
        )}

        <button
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors whitespace-nowrap flex-shrink-0"
          onClick={exportDiagram}
          title="Exportar diagrama como arquivo JSON"
        >
          📄 Exportar JSON
        </button>

        {/* Novo botão de Configurações das tabelas */}
        {currentDiagramId && (
          <button
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAccessConfig(true);
            }}
            title="Configurar classificações e permissões de acesso"
          >
            <span className="text-base">⚙️</span>
            Configurações das tabelas
          </button>
        )}

        {/* Save status indicator - moved before info icon */}
        {saveStatus === 'saved' && currentDiagramId && (
          <span className="text-xs text-green-600 font-medium flex items-center whitespace-nowrap ml-2">
            ✓ Salvo no banco
          </span>
        )}
        
        {saveStatus === 'saving' && (
          <div className="flex items-center space-x-1 text-blue-600 whitespace-nowrap ml-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-xs">Salvando...</span>
          </div>
        )}

        {/* Info icon with hover instructions - moved to last position */}
        <div className="relative group">
          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
            <span className="text-blue-600 text-xs">ℹ️</span>
          </div>
          
          {/* Tooltip with instructions */}
          <div className="absolute right-0 bottom-full mb-2 w-96 bg-gray-800 text-white text-xs rounded-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-gray-200 mb-2">Como Usar:</div>
                <div className="space-y-1.5">
                  <div><strong className="text-blue-300">Mover:</strong> Arraste a tabela</div>
                  <div><strong className="text-blue-300">Conectar:</strong> Arraste pelos pontos azuis nas bordas</div>
                  <div><strong className="text-blue-300">Editar:</strong> Duplo clique no texto</div>
                  <div><strong className="text-blue-300">Adicionar:</strong> Clique no canvas (modo adicionar)</div>
                  <div><strong className="text-blue-300">Excluir:</strong> Selecione + botão excluir</div>
                </div>
              </div>
              
              <div className="border-t border-gray-600 pt-2">
                <div className="font-semibold text-gray-200 mb-1">Ferramentas:</div>
                <div className="space-y-1">
                  <div><strong className="text-green-300">🖱️ Selecionar:</strong> Selecionar e conectar elementos</div>
                  <div><strong className="text-green-300">📊 Adicionar Tabela:</strong> Clique no canvas para criar tabela</div>
                  <div><strong className="text-green-300">💾 Salvar:</strong> Salva no banco de dados</div>
                  <div><strong className="text-green-300">📄 Exportar:</strong> Exporta como JSON</div>
                </div>
              </div>
              
              <div className="border-t border-gray-600 pt-2 text-gray-300">
                <div>{nodes.length} tabela(s) • {edges.length} conexão(ões)</div>
              </div>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
      
      {/* Modal de Configuração de Acesso */}
      <AccessConfigModal
        isOpen={showAccessConfig}
        onClose={() => setShowAccessConfig(false)}
        diagramId={currentDiagramId}
        diagramName={diagramName}
      />
    </div>
  );
};