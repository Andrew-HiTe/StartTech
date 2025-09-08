/**
 * Componente Header do T-Draw
 * Cabeçalho principal da aplicação
 */

import React from 'react';
import Buttons from '../Buttons';
import './Header.css';

const Header = (props) => {
  return (
    <header className='cabecalho'>
      <img src={props.imagens} alt='Logo T-Draw'/>
      <Buttons nameButton="Entrar" onClick={props.onShowLogin}/>
    </header>
  );
};

export default Header;
