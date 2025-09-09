import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export const Header = ({ 
  projectName, 
  diagramName = "DIAGRAMA", 
  onDiagramNameChange 
}) => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [isEditingDiagramName, setIsEditingDiagramName] = useState(false);
  const [editValue, setEditValue] = useState(diagramName);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
        
        {/* Right Side - User Menu and Actions */}
        <div className="flex items-center space-x-4">
          {/* Access Manager Button (Only for admins) */}
          {isAdmin && (
            <button 
              onClick={() => navigate('/access-manager')}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <span>🔐</span>
              <span>Gerenciar Acessos</span>
            </button>
          )}

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm text-gray-700">{user?.email || 'Usuário'}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    {user?.email}
                    {isAdmin && <span className="block text-xs text-blue-600">Administrador</span>}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🚪 Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
