/**
 * Componente Text do T-Draw
 * Seção principal de texto e imagem da página inicial
 */

import React from 'react';
import { Button } from './Button';

interface TextProps {
  titulo: string;
  paragrafo: string;
  diagrama: string;
  onStartClick?: () => void;
}

export const TextMain: React.FC<TextProps> = ({ 
  titulo, 
  paragrafo, 
  diagrama, 
  onStartClick 
}) => {
  return (
    <main className="min-h-screen flex items-center px-8 lg:px-20 text-white">
      <section className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo de texto */}
          <div className="space-y-6">
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
              style={{
                background: `linear-gradient(
                  90deg,
                  rgba(0, 255, 212, 1) 0%,
                  rgba(164, 77, 255, 1) 50%,
                  rgba(255, 0, 158, 1) 100%
                )`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {titulo}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed">
              {paragrafo}
            </p>
            <div className="pt-4">
              <Button 
                text="Comece já" 
                onClick={onStartClick || (() => {})}
              />
            </div>
          </div>
          
          {/* Imagem do diagrama */}
          <div className="flex justify-center lg:justify-end">
            <div className="transition-transform duration-200 ease-in-out hover:-translate-y-2">
              <img 
                src={diagrama} 
                alt="Diagrama T-Draw"
                className="w-full max-w-md lg:max-w-lg border-4 border-transparent rounded-2xl transition-all duration-200 ease-in-out hover:shadow-[0_8px_16px_rgba(255,255,255,0.3)]"
                style={{
                  background: `
                    linear-gradient(#fff, #fff) padding-box,
                    linear-gradient(
                      90deg,
                      rgba(0, 255, 212, 1) 0%,
                      rgba(164, 77, 255, 1) 50%,
                      rgba(4, 87, 167, 1) 100%
                    ) border-box
                  `,
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
