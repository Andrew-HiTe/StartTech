/**
 * Componente Home do T-Draw
 * Página inicial da aplicação antes do login
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../shared/Header';
import { TextMain } from '../shared/TextMain';
import { FeaturesList } from '../shared/FeaturesList';

// Importando as imagens
import homelogo from '../../assets/images/homelogo.png';
import diagrama from '../../assets/images/diagrama.jpg';
import background from '../../assets/images/background.jpg';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleShowLogin = () => {
    navigate('/login');
  };

  const handleStartClick = () => {
    navigate('/login');
  };

  return (
    <div 
      className="page-home min-h-screen"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Header 
        logo={homelogo} 
        onShowLogin={handleShowLogin} 
      />
      <div className="pt-16 md:pt-20"> {/* Compensar altura do header fixo */}
        <TextMain 
          titulo="Diagramas inteligentes para projetos eficientes." 
          paragrafo="Um gerenciador e criador de diagramas de projetos que une colaboração em tempo real com segurança. Organize ideias, conecte equipes e proteja cada etapa do seu projeto." 
          diagrama={diagrama}
          onStartClick={handleStartClick}
        />
        <FeaturesList />
      </div>
    </div>
  );
};
