import React, { useState, useEffect, useCallback } from 'react';
import { useDiagramStore } from '../stores/diagramStore.js';

export const Toolbar = () => {
  const [showLoadDialog, setShowLoadDialog] = useState(false);
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
    loadDiagramFromDB,
    isDirty,
    autoSaveEnabled,
    toggleAutoSave,
    currentDiagramId,
    createNewDiagram,
    markDirty
  } = useDiagramStore();

  // Estado para feedback visual do auto-save
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'dirty'
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

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

  const handleNewDiagram = () => {
    createNewDiagram();
    setSaveStatus('saved');
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
    },
    {
      id: 'add-system',
      label: 'Adicionar Sistema',
      icon: '🖥️',
      active: currentTool === 'add-system',
      description: 'Clique ou arraste no canvas para adicionar novo sistema'
    }
  ];

  return (
    <div className="toolbar bg-white border-b border-gray-300 p-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2">
        {toolButtons.map(tool => (
          <button
            key={tool.id}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
              tool.active 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setCurrentTool(tool.id)}
            title={tool.description}
          >
            <span className="mr-1">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
        
        {selectedElements.length > 0 && (
          <button
            className="px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-150"
            onClick={handleDelete}
            title="Excluir elementos selecionados"
          >
            <span className="mr-1">🗑️</span>
            Excluir ({selectedElements.length})
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Auto-save toggle */}
        <label className="flex items-center space-x-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={toggleAutoSave}
            className="rounded"
          />
          <span>Auto-salvar</span>
        </label>

        {/* Save status indicator */}
        <div className="flex items-center space-x-1">
          {saveStatus === 'saving' && (
            <div className="flex items-center space-x-1 text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="text-xs">Salvando...</span>
            </div>
          )}
          {saveStatus === 'dirty' && autoSaveEnabled && (
            <span className="text-xs text-orange-600 font-medium">
              • Alterações detectadas
            </span>
          )}
          {saveStatus === 'dirty' && !autoSaveEnabled && (
            <span className="text-xs text-red-600 font-medium">
              • Não salvo
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-green-600 font-medium">
              ✓ Salvo
            </span>
          )}
        </div>

        {/* Current diagram name */}
        {diagramName && (
          <span className="text-sm text-gray-600 font-medium max-w-32 truncate">
            {diagramName}
          </span>
        )}

        {/* Manual save button (only when auto-save is off) */}
        {!autoSaveEnabled && (
          <button
            onClick={handleManualSave}
            disabled={!isDirty || saveStatus === 'saving'}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            💾 Salvar
          </button>
        )}

        {/* New diagram button */}
        <button
          onClick={handleNewDiagram}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
        >
          � Novo
        </button>

        {/* Load button */}
        <button
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          onClick={() => setShowLoadDialog(true)}
        >
          📂 Carregar
        </button>

        <button
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
          onClick={exportDiagram}
        >
          📤 Exportar
        </button>
      </div>

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Carregar Diagrama</h3>
            <p className="text-gray-600 mb-4">
              Use a barra lateral à esquerda para selecionar um diagrama.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowLoadDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
