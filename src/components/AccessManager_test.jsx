/**
 * Gerenciador de Acessos - Página administrativa (TESTE)
 * Permite visualizar e gerenciar usuários com acesso aos diagramas
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AccessManager = () => {
  const navigate = useNavigate();
  
  console.log('🔧 AccessManager renderizado - versão teste');

  return (
    <div className="min-h-screen bg-red-100 p-8">
      <h1 className="text-3xl font-bold text-red-800">
        🔐 Teste AccessManager
      </h1>
      <p className="mt-4 text-red-600">
        Se você está vendo isso, o componente está sendo renderizado!
      </p>
      <button
        onClick={() => navigate('/diagram')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Voltar ao Diagrama
      </button>
    </div>
  );
};
