/**
 * Componente Home Simplificado para teste
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HomeTest = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Home - Teste</h1>
      <button onClick={handleLogin} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
        Ir para Login
      </button>
    </div>
  );
};
