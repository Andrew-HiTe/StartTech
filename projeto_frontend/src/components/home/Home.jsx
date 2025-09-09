/**
 * Componente Home do StartTech
 * Página inicial da aplicação antes do login
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  console.log('🏠 Home component rendering...');
  const navigate = useNavigate();

  const handleShowLogin = () => {
    console.log('Navigating to login...');
    navigate('/login');
  };

  const handleStartClick = () => {
    console.log('Start button clicked...');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center p-8">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">StartTech</h1>
        <p className="text-xl text-gray-600 mb-8">
          Crie Diagramas C4 Profissionais
        </p>
        <div className="space-x-4">
          <button
            onClick={handleStartClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Começar Agora
          </button>
          <button
            onClick={handleShowLogin}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Entrar
          </button>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Diagramas C4</h3>
            <p className="text-gray-600">Crie diagramas seguindo a metodologia C4</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Colaboração</h3>
            <p className="text-gray-600">Trabalhe em equipe com controle de acesso</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-xl font-semibold mb-2">Exportação</h3>
            <p className="text-gray-600">Exporte seus diagramas em diversos formatos</p>
          </div>
        </div>
      </div>
    </div>
  );
};
