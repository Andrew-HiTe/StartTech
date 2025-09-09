// App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import Home from './components/home/Home.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import AccessManager from './components/access/AccessManager.jsx';
import DiagramFlowBasic from './components/diagrams/DiagramFlowBasic.jsx';
import './App.css';


// Importar imagens
import homelogo from './imagens/homelogo.png';
import diagrama from './imagens/diagrama.jpg';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              imagem={homelogo}
              diag={diagrama}
            />
          } 
        />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/access-manager" element={<AccessManager />} />
        <Route 
          path="/diagram" 
          element={
            <ReactFlowProvider>
              <DiagramFlowBasic />
            </ReactFlowProvider>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;