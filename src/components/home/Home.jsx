/**
 * Componente Home do T-Draw
 * Página inicial da aplicação antes do login
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../shared/Header/index';
import ListaSuspensa from '../shared/ListaSuspensa';
import Text from '../shared/Text';
import SobreNos from '../shared/SobreNos';
import './Home.css';

const Home = ({ imagem, diag, valorestdraw }) => {
  const navigate = useNavigate();

  const handleShowLogin = () => {
    navigate('/login');
  };

  return (
    <div className="home-wrapper">
      <Header imagens={imagem} onShowLogin={handleShowLogin} />
      <Text 
        titulo="Diagramas inteligentes para projetos eficientes." 
        paragrafo="Um gerenciador e criador de diagramas de projetos que une colaboração em tempo real com segurança. Organize ideias, conecte equipes e proteja cada etapa do seu projeto." 
        diagrama={diag}
      />
      <ListaSuspensa />
      <SobreNos valores={valorestdraw}/>
    </div>
  );
};

export { Home };
