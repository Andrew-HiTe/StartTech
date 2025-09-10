// Componentes shared simples para Home
import React from 'react';

export const Header = ({ logo, onShowLogin }) => (
  <header className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <span className="ml-2 text-xl font-bold text-gray-900">StartTech</span>
        </div>
        <button
          onClick={onShowLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Entrar
        </button>
      </div>
    </div>
  </header>
);

export const TextMain = ({ onStartClick }) => (
  <div className="text-center py-16">
    <h1 className="text-5xl font-bold text-gray-900 mb-6">
      Crie Diagramas C4 Profissionais
    </h1>
    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
      Uma ferramenta moderna e intuitiva para criar e gerenciar diagramas de arquitetura C4. 
      Colabore em tempo real e mantenha sua documentação sempre atualizada.
    </p>
    <button
      onClick={onStartClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors"
    >
      Começar Agora
    </button>
  </div>
);

export const FeaturesList = () => (
  <div className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Principais Funcionalidades
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Diagramas C4</h3>
          <p className="text-gray-600">Crie diagramas seguindo a metodologia C4 com facilidade</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-2">Colaboração</h3>
          <p className="text-gray-600">Trabalhe em equipe com controle de acesso e permissões</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">💾</div>
          <h3 className="text-xl font-semibold mb-2">Exportação</h3>
          <p className="text-gray-600">Exporte seus diagramas em diversos formatos</p>
        </div>
      </div>
    </div>
  </div>
);
