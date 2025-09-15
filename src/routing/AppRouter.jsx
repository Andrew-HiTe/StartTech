/**
 * Aplicação Principal com Sistema de Roteamento
 * Conecta: Home -> Login -> Diagrama -> Gerenciador de Acessos
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';

// Importar páginas (convertendo de TypeScript para JavaScript quando necessário)
import { Home } from './components/home/Home';
import { LoginForm } from './components/auth/LoginForm';
import { AccessManager } from './components/AccessManager.jsx';

// Componente do diagrama (convertendo para JSX)
import DiagramApp from '../components/diagram/DiagramApp.jsx';

// Hook para gerenciar autenticação
import { useAuth } from './hooks/useAuth.jsx';

// Componente de proteção de rotas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente principal da aplicação
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Página inicial */}
          <Route path="/" element={<Home />} />
          
          {/* Login */}
          <Route path="/login" element={<LoginForm />} />
          
          {/* Diagrama (protegido) */}
          <Route 
            path="/diagram" 
            element={
              <ProtectedRoute>
                <ReactFlowProvider>
                  <DiagramApp />
                </ReactFlowProvider>
              </ProtectedRoute>
            } 
          />
          
          {/* Gerenciador de Acessos (protegido) */}
          <Route 
            path="/access-manager" 
            element={
              <ProtectedRoute>
                <AccessManager />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota de fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
