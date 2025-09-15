/**
 * Componente Buttons do T-Draw
 * Botão reutilizável da aplicação
 */

import React from 'react';
import './Buttons.css';

const Buttons = (props) => {
  return (
    <div className='button'>
      <button onClick={props.onClick}>{props.nameButton}</button>
    </div>
  );
};

export default Buttons;
