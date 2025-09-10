/**
 * Componente Text do T-Draw
 * Seção principal de texto e imagem da página inicial
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Buttons from '../Buttons';
import './Text.css';

const Text = (props) => {
  const navigate = useNavigate();

  const handleComecaJa = () => {
    navigate('/login');
  };

  return (
    <main className='textmain'>
      <section className='texthome'>
        <div className='texthome-content'>
          <h1>{props.titulo}</h1>
          <p>{props.paragrafo}</p>
          <Buttons nameButton="Comece já" onClick={handleComecaJa}/>
        </div>
        <div className='texthome-diagrama'>
          <img src={props.diagrama} alt="Diagrama T-Draw"/>
        </div>
      </section>
    </main>
  );
};

export default Text;
