/**
 * Componente Header do T-Draw
 * Cabeçalho principal da aplicação com funcionalidade de scroll
 */

import React, { useState, useEffect } from 'react';
import Buttons from '../Buttons';
import './Header.css';

const Header = (props) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Mostrar header se:
      // 1. Está no topo da página (currentScrollY < 100)
      // 2. Está fazendo scroll para cima
      if (currentScrollY < 100 || currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else {
        // Esconder header se está fazendo scroll para baixo
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Adicionar event listener com throttle para performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollY]);

  return (
    <header className={`cabecalho ${isVisible ? 'show' : 'hide'}`}>
      <img src={props.imagens} alt='Logo T-Draw'/>
      <Buttons nameButton="Entrar" onClick={props.onShowLogin}/>
    </header>
  );
};

export default Header;
