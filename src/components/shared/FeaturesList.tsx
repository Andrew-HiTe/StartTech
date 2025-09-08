/**
 * Componente FeaturesList do T-Draw
 * Lista de funcionalidades da aplicação
 */

import React from 'react';

interface Funcionalidade {
  titulo: string;
  descricao: string;
  icone: string;
}

const funcionalidades: Funcionalidade[] = [
  {
    titulo: "Criação de diagramas online",
    descricao: "Interface intuitiva para montar fluxos, mapas mentais e representações visuais de projetos.",
    icone: "📝"
  },
  {
    titulo: "Segurança de dados",
    descricao: "Acesso restrito de acordo com as liberações e permissões definidas no projeto.",
    icone: "🔒"
  },
  {
    titulo: "Gestão de permissões",
    descricao: "Controle detalhado para quem pode visualizar ou editar cada diagrama.",
    icone: "🛡️"
  },
  {
    titulo: "Organização de projetos",
    descricao: "Criação de pastas e categorias para manter os projetos organizados e acessíveis rapidamente.",
    icone: "📂"
  },
  {
    titulo: "Colaboração em equipe",
    descricao: "Múltiplos usuários podem trabalhar simultaneamente nos mesmos projetos.",
    icone: "👥"
  },
  {
    titulo: "Acesso em nuvem",
    descricao: "Disponibilidade dos diagramas em qualquer dispositivo, a qualquer momento.",
    icone: "☁️"
  }
];

export const FeaturesList: React.FC = () => {
  return (
    <section className="py-16 px-6 md:px-8 lg:px-12 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-2xl md:text-3xl lg:text-4xl mb-12 text-gray-800 font-bold">
          Principais Funcionalidades
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {funcionalidades.map((func, index) => (
            <div 
              key={index} 
              className="p-6 md:p-8 rounded-2xl text-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg border-4 border-transparent"
              style={{
                background: `
                  linear-gradient(white, white) padding-box,
                  linear-gradient(
                    90deg,
                    rgba(0, 255, 212, 1) 0%,
                    rgba(164, 77, 255, 1) 50%,
                    rgba(4, 87, 167, 1) 100%
                  ) border-box
                `,
              }}
            >
              <div className="text-3xl md:text-4xl lg:text-5xl mb-4">{func.icone}</div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                {func.titulo}
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {func.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
