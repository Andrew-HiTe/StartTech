/**
 * Componente Button do T-Draw
 * Botão reutilizável da aplicação
 */

import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ 
  text, 
  onClick, 
  className = '', 
  type = 'button' 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        text-white rounded-lg border-none cursor-pointer
        border-4 border-transparent bg-gradient-to-r
        from-[#002233] to-[#002233] bg-clip-padding
        relative overflow-hidden
        hover:text-white transition-all duration-300
        px-6 py-3 text-base md:text-lg font-medium
        ${className}
      `}
      style={{
        background: `
          linear-gradient(#002233, #002233) padding-box,
          linear-gradient(
            90deg,
            rgba(0, 255, 212, 1) 0%,
            rgba(164, 77, 255, 1) 50%,
            rgba(4, 87, 167, 1) 100%
          ) border-box
        `,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `
          linear-gradient(
            90deg,
            rgba(0, 255, 212, 1) 0%,
            rgba(164, 77, 255, 1) 50%,
            rgba(4, 87, 167, 1) 100%
          ) border-box
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `
          linear-gradient(#002233, #002233) padding-box,
          linear-gradient(
            90deg,
            rgba(0, 255, 212, 1) 0%,
            rgba(164, 77, 255, 1) 50%,
            rgba(4, 87, 167, 1) 100%
          ) border-box
        `;
      }}
    >
      {text}
    </button>
  );
};
