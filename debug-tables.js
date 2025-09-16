/**
 * Script para debugar o problema de criação de tabelas
 */

console.log('🔧 Iniciando debug da criação de tabelas...');

// Aguardar um momento e verificar o estado
setTimeout(() => {
  console.log('📊 Estado atual da aplicação:');
  console.log('- URL atual:', window.location.href);
  console.log('- ReactFlow presente:', !!window.ReactFlow);
  
  // Verificar se há store global acessível
  if (window.diagramStore) {
    console.log('- Store encontrado, estado:', window.diagramStore.getState());
  } else {
    console.log('- Store não encontrado globalmente');
  }
}, 2000);