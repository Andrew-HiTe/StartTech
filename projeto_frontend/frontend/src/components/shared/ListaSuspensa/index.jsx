/**
 * Componente ListaSuspensa do T-Draw
 * Lista de funcionalidades da aplicação
 */

import React from 'react';
import './ListaSuspensa.css';

const funcionalidades = [
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

const ListaSuspensa = () => {
  return (
    <section className="funcionalidades-section">
      <h2>Principais Funcionalidades</h2>
      <div className="funcionalidades-grid">
        {funcionalidades.map((func, index) => (
          <div key={index} className="funcionalidade-card">
            <div className="funcionalidade-icone">{func.icone}</div>
            <h3>{func.titulo}</h3>
            <p>{func.descricao}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ListaSuspensa;
