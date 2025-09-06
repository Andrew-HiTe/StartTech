import React, { useState } from 'react';
import { useDiagramManager } from '../../stores/diagramManager';


export const DiagramTabs = ({ projectName }) => {
  const [showNewDiagramModal, setShowNewDiagramModal] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');
  
  const {
    diagrams,
    currentDiagramId,
    createDiagram,
    selectDiagram,
    deleteDiagram,
    getCurrentDiagram
  } = useDiagramManager();

  const currentDiagram = getCurrentDiagram();

  const handleCreateDiagram = () => {
    if (newDiagramName.trim()) {
      createDiagram(newDiagramName.trim(), 'c4');
      setNewDiagramName('');
      setShowNewDiagramModal(false);
    }
  };

  const handleCloseTab = (diagramId, e) => {
    e.stopPropagation();
    if (diagrams.length > 1) {
      deleteDiagram(diagramId);
    }
  };

  return (
    <div className="px-6 py-4 bg-transparent border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Project Name */}
        <div className="flex items-center gap-4">
          <h1 className="text-gray-800 font-semibold text-2xl font-[Nunito Sans]">
            {projectName}
          </h1>
          
          {/* Diagram Tabs */}
          <div className="flex items-center gap-2">
            {diagrams.map((diagram) => (
              <div
                key={diagram.id}
                onClick={() => selectDiagram(diagram.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
                  ${currentDiagramId === diagram.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                  }
                `}
              >
                <span className="text-sm font-medium">{diagram.name}</span>
                {diagrams.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(diagram.id, e)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            {/* Add New Tab Button */}
            <button
              onClick={() => setShowNewDiagramModal(true)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Current Diagram Info */}
        <div className="flex items-center gap-4">
          {currentDiagram && (
            <span className="text-gray-600 font-semibold text-lg uppercase tracking-wide">
              {currentDiagram.type.toUpperCase()}
            </span>
          )}
          
          {/* Settings Icon */}
          <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* New Diagram Modal */}
      {showNewDiagramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Novo Diagrama</h2>
            <input
              type="text"
              value={newDiagramName}
              onChange={(e) => setNewDiagramName(e.target.value)}
              placeholder="Nome do diagrama..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateDiagram()}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCreateDiagram}
                disabled={!newDiagramName.trim()}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setShowNewDiagramModal(false);
                  setNewDiagramName('');
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
