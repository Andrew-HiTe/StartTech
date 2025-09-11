import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Página de Teste</h1>
      <p>Se você consegue ver isso, o React está funcionando.</p>
      <button onClick={() => alert('Botão funcionando!')}>
        Testar Interação
      </button>
    </div>
  );
};

export default TestComponent;
