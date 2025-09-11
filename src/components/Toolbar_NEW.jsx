// Toolbar component for diagram tools
import React, { useState } from 'react';
import { useDiagramStore } from '../stores/diagramStore.js';

export const Toolbar = () => {
  const { 
    currentTool, 
    setCurrentTool, 
    selectedElements, 
    deleteNode, 
    deleteEdge,
    nodes,
    edges,
    exportDiagram,
    // Persistência
    diagramName,
    setDiagramName,
    currentDiagramId,
    isDirty,
    isSaving,
    isLoading,
    saveDiagramToDB,
    loadAvailableDiagrams,
    loadDiagramFromDB,
    createNewDiagram,
    availableDiagrams,
    autoSaveEnabled,
    toggleAutoSave
  } = useDiagramStore();
  
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [tempDiagramName, setTempDiagramName] = useState(diagramName);

  console.log('🔧 Toolbar renderizado, currentTool:', currentTool);

  // Handlers
  const handleSave = async () => {
    if (!tempDiagramName.trim()) return;
    
    const result = await saveDiagramToDB(tempDiagramName.trim());
    if (result.success) {
      setDiagramName(tempDiagramName.trim());
      setShowSaveDialog(false);
    } else {
      alert(`Erro ao salvar: ${result.error}`);
    }
  };

  const handleLoad = async (diagramId) => {
    if (isDirty && !window.confirm('Descartar alterações não salvas?')) return;
    
    const result = await loadDiagramFromDB(diagramId);
    if (result.success) {
      setShowLoadDialog(false);
      setTempDiagramName(result.diagram.name);
    } else {
      alert(`Erro ao carregar: ${result.error}`);
    }
  };

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
    <div className="w-full px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-4">
      {/* Tool Buttons */}
      <div className="flex items-center gap-2">
        {toolButtons.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setCurrentTool(tool.id)}
            title={tool.description}
            className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              tool.active
                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <span>{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Instruções dinâmicas */}
      <div className="ml-4 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-200">
        {currentTool === 'select' ? (
          <span>💡 Clique em nós para selecioná-los, arraste handles azuis para conectar</span>
        ) : currentTool === 'add-table' ? (
          <span>💡 Clique ou arraste no canvas para criar nova tabela</span>
        ) : (
          <span>💡 Selecione uma ferramenta</span>
        )}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Botão Novo */}
        <button
          onClick={() => {
            if (isDirty && !window.confirm('Descartar alterações não salvas?')) return;
            createNewDiagram();
          }}
          className="px-3 py-2 rounded-md border bg-blue-500 text-white border-blue-500 hover:bg-blue-600 text-sm font-medium transition-all duration-200 flex items-center gap-2"
        >
          <span>📄</span>
          <span>Novo</span>
        </button>

        {/* Botão Save */}
        <button
          onClick={() => {
            setTempDiagramName(diagramName);
            setShowSaveDialog(true);
          }}
          disabled={isSaving || nodes.length === 0}
          className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            isSaving || nodes.length === 0
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : isDirty
              ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
              : 'bg-green-500 text-white border-green-500 hover:bg-green-600'
          }`}
        >
          <span>{isSaving ? '⏳' : isDirty ? '💾*' : '💾'}</span>
          <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
        </button>

        {/* Botão Load */}
        <button
          onClick={() => {
            loadAvailableDiagrams();
            setShowLoadDialog(true);
          }}
          disabled={isLoading}
          className="px-3 py-2 rounded-md border bg-purple-500 text-white border-purple-500 hover:bg-purple-600 text-sm font-medium transition-all duration-200 flex items-center gap-2"
        >
          <span>{isLoading ? '⏳' : '📂'}</span>
          <span>{isLoading ? 'Carregando...' : 'Carregar'}</span>
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300" />

        <button
          onClick={handleDelete}
          disabled={selectedElements.length === 0}
          className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            selectedElements.length > 0
              ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          }`}
        >
          <span>🗑️</span>
          <span>Excluir</span>
        </button>

        <button
          onClick={exportDiagram}
          className="px-3 py-2 rounded-md border bg-green-500 text-white border-green-500 hover:bg-green-600 text-sm font-medium transition-all duration-200 flex items-center gap-2"
        >
          <span>📤</span>
          <span>Exportar</span>
        </button>
      </div>

      {/* Status info - Compacto */}
      <div className="ml-4 flex items-center gap-4 text-sm text-gray-600">
        <span className="font-medium">
          {currentDiagramId ? `ID: ${currentDiagramId}` : 'Novo diagrama'}
          {isDirty && ' *'}
        </span>
        <span className="font-medium">
          {selectedElements.length > 0 
            ? `${selectedElements.length} selecionado(s)`
            : 'Nenhum selecionado'
          }
        </span>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {nodes.length} tabelas • {edges.length} conexões
        </span>
        {/* Toggle Auto-Save */}
        <button
          onClick={toggleAutoSave}
          className={`text-xs px-2 py-1 rounded border ${
            autoSaveEnabled
              ? 'bg-green-100 text-green-600 border-green-300'
              : 'bg-gray-100 text-gray-500 border-gray-300'
          }`}
        >
          Auto-save: {autoSaveEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Modal Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {currentDiagramId ? 'Salvar Diagrama' : 'Salvar Novo Diagrama'}
            </h3>
            <input
              type="text"
              value={tempDiagramName}
              onChange={(e) => setTempDiagramName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Nome do diagrama"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setShowSaveDialog(false);
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!tempDiagramName.trim() || isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Carregar Diagrama</h3>
            
            {availableDiagrams.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum diagrama salvo encontrado
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {availableDiagrams.map((diagram) => (
                  <div
                    key={diagram.id}
                    className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                      diagram.id === currentDiagramId ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                    }`}
                    onClick={() => handleLoad(diagram.id)}
                  >
                    <div className="font-medium">{diagram.name}</div>
                    <div className="text-sm text-gray-500">
                      Criado: {new Date(diagram.created_at).toLocaleDateString()}
                      {diagram.updated_at && (
                        <span> • Atualizado: {new Date(diagram.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
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
