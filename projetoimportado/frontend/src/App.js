/**
 * Componente principal da aplicação T-Draw
 * Gerencia o roteamento entre Home, Login e Access Manager
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/home/Home';
import LoginForm from './components/auth/LoginForm';
import AccessManager from './components/access/AccessManager';
import './App.css';

// Importar imagens
import homelogo from './imagens/homelogo.png';
import diagrama from './imagens/diagrama.jpg';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Rota da página inicial */}
        <Route 
          path="/" 
          element={
            <Home 
              imagem={homelogo}
              diag={diagrama}
            />
          } 
        />
        
        {/* Rota do login */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* Rota do gerenciador de acessos */}
        <Route path="/access-manager" element={<AccessManager />} />
        
        {/* Redirecionar rotas não encontradas para home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
