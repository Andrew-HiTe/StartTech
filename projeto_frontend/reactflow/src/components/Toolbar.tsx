// Toolbar component for diagram tools
import React from 'react';
import { useDiagramStore } from '../stores/diagramStore';

export const Toolbar: React.FC = () => {
  const { 
    currentTool, 
    setCurrentTool, 
    selectedElements, 
    deleteNode, 
    deleteEdge,
    nodes,
    edges,
    exportDiagram
  } = useDiagramStore();

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
      id: 'select' as const,
      label: 'Selecionar',
      icon: '🖱️',
      active: currentTool === 'select',
      description: 'Mover e selecionar elementos'
    },
    {
      id: 'add-table' as const,
      label: 'Adicionar Tabela',
      icon: '📊',
      active: currentTool === 'add-table',
      description: 'Clique no canvas para adicionar'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-3">
      {/* Tool buttons */}
      <div className="flex items-center gap-2">
        {toolButtons.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setCurrentTool(tool.id)}
            title={tool.description}
            className={`px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              tool.active
                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            <span>{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
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
          <span>💾</span>
          <span>Exportar</span>
        </button>
      </div>

      {/* Status info - Compacto */}
      <div className="ml-4 flex items-center gap-4 text-sm text-gray-600">
        <span className="font-medium">
          {selectedElements.length > 0 
            ? `${selectedElements.length} selecionado(s)`
            : 'Nenhum selecionado'
          }
        </span>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {nodes.length} tabelas • {edges.length} conexões
        </span>
      </div>
    </div>
  );
};
