import React from 'react';

const DiagramFlowSimple = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Diagrama Simplificado</h1>
      <p>Componente de diagrama simplificado para debug.</p>
      <div style={{ 
        width: '100%', 
        height: '400px', 
        border: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9'
      }}>
        <p>Área do Diagrama</p>
      </div>
    </div>
  );
};

export default DiagramFlowSimple;
