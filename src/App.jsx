/**
 * Aplicação Principal com Sistema de Roteamento
 * Conecta: Home -> Login -> Diagrama -> Gerenciador de Acessos
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';

// Importar páginas
import { Home } from './components/home/Home.jsx';
import { LoginForm } from './components/auth/LoginForm.jsx';
import { AccessManager } from './components/AccessManager.jsx';

// Componente do diagrama
import DiagramApp from './DiagramApp.jsx';

// Hook para gerenciar autenticação
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';

// Importar imagens
import homelogo from './assets/images/homelogo.png';
import diagrama from './assets/images/diagrama.jpg';
import valores from './assets/images/valores.png';

// Componente de proteção de rotas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente principal da aplicação
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Página inicial */}
            <Route 
              path="/" 
              element={
                <Home 
                  imagem={homelogo}
                  diag={diagrama}
                  valorestdraw={valores}
                />
              } 
            />
            
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
    </AuthProvider>
  );
}

export default App;
