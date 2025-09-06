import React, { useState, useCallback } from 'react';



export const Header = ({ 
  projectName, 
  diagramName = "DIAGRAMA", 
  onDiagramNameChange 
}) => {
  const [isEditingDiagramName, setIsEditingDiagramName] = useState(false);
  const [editValue, setEditValue] = useState(diagramName);

  const handleDiagramNameClick = useCallback(() => {
    if (onDiagramNameChange) {
      setIsEditingDiagramName(true);
      setEditValue(diagramName);
    }
  }, [diagramName, onDiagramNameChange]);

  const handleEditSubmit = useCallback(() => {
    if (onDiagramNameChange && editValue.trim()) {
      onDiagramNameChange(editValue.trim());
    }
    setIsEditingDiagramName(false);
  }, [editValue, onDiagramNameChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingDiagramName(false);
      setEditValue(diagramName);
    }
  }, [handleEditSubmit, diagramName]);

  return (
    <div className="px-6 py-4 bg-transparent">
      <div className="flex items-center justify-between">
        {/* Project Info */}
        <div className="flex items-center gap-2">
          <h1 className="text-gray-800 font-semibold" style={{ fontSize: '24px', fontFamily: 'Nunito Sans, sans-serif' }}>
            {projectName}
          </h1>
          
          {isEditingDiagramName ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleKeyDown}
              className="text-gray-600 font-semibold text-lg uppercase tracking-wide bg-yellow-50 border-2 border-yellow-400 rounded px-2 py-1 focus:outline-none focus:border-yellow-500"
              autoFocus
              style={{ fontFamily: 'Nunito Sans, sans-serif' }}
            />
          ) : (
            <span 
              className={`text-gray-600 font-semibold text-lg uppercase tracking-wide ${
                onDiagramNameChange ? 'cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors' : ''
              }`}
              onClick={handleDiagramNameClick}
              title={onDiagramNameChange ? 'Clique para editar o nome do diagrama' : ''}
            >
              {diagramName}
            </span>
          )}
        </div>
        
        {/* Settings Icon */}
        <div className="flex items-center">
          <button className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
