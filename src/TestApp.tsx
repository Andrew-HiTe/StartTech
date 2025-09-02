import React from 'react';

function TestApp() {
  return (
    <div className="w-full h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🎉 React App Funcionando!
        </h1>
        <p className="text-gray-600">
          Se você vê esta mensagem, a aplicação React está rodando corretamente.
        </p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800 font-semibold">
            ✅ Vite funcionando<br/>
            ✅ React funcionando<br/>
            ✅ Tailwind funcionando
          </p>
        </div>
      </div>
    </div>
  );
}

export default TestApp;
