/**
 * Componente Header do T-Draw
 * Cabeçalho principal da aplicação
 */

import React from 'react';
import { Button } from './Button';

interface HeaderProps {
  logo: string;
  onShowLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ logo, onShowLogin }) => {
  return (
    <header className="fixed top-0 left-0 w-full h-16 md:h-20 bg-[#EAF9FF] flex justify-between items-center z-[1000] px-6 md:px-8 lg:px-12 shadow-sm">
      <img 
        src={logo} 
        alt="Logo T-Draw" 
        className="h-8 md:h-12 lg:h-14 object-contain" 
      />
      <Button 
        text="Entrar" 
        onClick={onShowLogin}
        className="text-sm md:text-base lg:text-lg px-4 py-2 md:px-6 md:py-3"
      />
    </header>
  );
};
