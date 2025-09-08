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
    },
    {
      id: 'connect' as const,
      label: 'Conectar',
      icon: '🔗',
      active: currentTool === 'connect',
      description: 'Arraste pelos pontos azuis'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-6 py-3 flex items-center gap-4">
      {/* Tool buttons */}
      <div className="flex items-center gap-2">
        {toolButtons.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setCurrentTool(tool.id)}
            title={tool.description}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
              tool.active
                ? 'bg-blue-500 text-white border-blue-500 shadow-md transform scale-105'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:scale-105'
            }`}
          >
            <span className="mr-2">{tool.icon}</span>
            {tool.label}
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
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
            selectedElements.length > 0
              ? 'bg-red-500 text-white border-red-500 hover:bg-red-600 hover:scale-105'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
          }`}
        >
          <span className="mr-2">🗑️</span>
          Excluir
        </button>

        <button
          onClick={exportDiagram}
          className="px-4 py-2 rounded-lg border bg-green-500 text-white border-green-500 hover:bg-green-600 hover:scale-105 text-sm font-medium transition-all duration-200"
        >
          <span className="mr-2">💾</span>
          Exportar
        </button>
      </div>

      {/* Status info */}
      <div className="ml-auto flex items-center gap-6 text-sm text-gray-600">
        <span className="font-medium">
          {selectedElements.length > 0 
            ? `${selectedElements.length} elemento(s) selecionado(s)`
            : 'Nenhum elemento selecionado'
          }
        </span>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {nodes.length} tabela(s) • {edges.length} conexão(ões)
        </span>
      </div>
    </div>
  );
};
