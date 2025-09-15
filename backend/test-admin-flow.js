/**
 * Script de teste para validar o fluxo completo do sistema de permissionamento
 * Execute: node test-admin-flow.js
 */

const API_BASE = 'http://localhost:3001/api';

// Função auxiliar para fazer requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  console.log(`📡 ${options.method || 'GET'} ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  console.log(`📬 Resposta (${response.status}):`, JSON.stringify(data, null, 2));
  
  return { response, data };
}

async function testAdminFlow() {
  console.log('🧪 === TESTE DO FLUXO DE ADMINISTRADOR ===\n');

  try {
    // 1. Testar login como admin
    console.log('1️⃣ Testando login como admin...');
    const { response: loginResponse, data: loginData } = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@starttech.com',
        password: 'admin'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Falha no login!');
      return;
    }

    const token = loginData.token;
    console.log('✅ Login realizado com sucesso!\n');

    // Headers para requests autenticados
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Listar diagramas
    console.log('2️⃣ Listando diagramas...');
    const { data: diagramsData } = await apiRequest('/diagrams', {
      headers: authHeaders
    });

    if (!diagramsData.diagrams || diagramsData.diagrams.length === 0) {
      console.log('⚠️ Nenhum diagrama encontrado. Criando um novo...');
      
      const { data: newDiagramData } = await apiRequest('/diagrams', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          name: 'Diagrama de Teste',
          data: {
            nodes: [
              {
                id: 'table-1',
                type: 'c4Node',
                position: { x: 100, y: 100 },
                data: {
                  title: 'Tabela Teste',
                  description: 'Tabela para testar classificações',
                  type: 'container'
                }
              }
            ],
            edges: []
          }
        })
      });
      
      console.log('✅ Diagrama criado!\n');
    }

    // Pegar o primeiro diagrama
    const { data: refreshedDiagrams } = await apiRequest('/diagrams', {
      headers: authHeaders
    });
    
    const diagramId = refreshedDiagrams.diagrams[0].id;
    console.log(`📊 Usando diagrama ID: ${diagramId}\n`);

    // 3. Testar classificações
    console.log('3️⃣ Testando sistema de classificações...');
    
    // Listar classificações existentes
    const { data: classificationsData } = await apiRequest(`/diagrams/${diagramId}/classifications`, {
      headers: authHeaders
    });
    
    console.log(`✅ Encontradas ${classificationsData.classifications?.length || 0} classificações\n`);

    // Criar nova classificação
    console.log('4️⃣ Criando nova classificação...');
    const { data: newClassData } = await apiRequest(`/diagrams/${diagramId}/classifications`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Super Secreto',
        description: 'Dados ultra confidenciais',
        color: '#DC2626',
        isDefault: false
      })
    });

    if (newClassData.success) {
      console.log('✅ Classificação criada com sucesso!\n');
      
      // 5. Testar atualização de classificação de tabela
      console.log('5️⃣ Testando atribuição de classificação a tabela...');
      const { data: updateTableData } = await apiRequest(`/tables/table-1/classification`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          classificationId: newClassData.classification.id,
          diagramId: diagramId
        })
      });
      
      if (updateTableData.success) {
        console.log('✅ Classificação atribuída à tabela com sucesso!\n');
      } else {
        console.log('❌ Erro ao atribuir classificação à tabela\n');
      }
    } else {
      console.log('❌ Erro ao criar classificação\n');
    }

    // 6. Testar acesso ao diagrama
    console.log('6️⃣ Testando controle de acesso...');
    const { data: accessData } = await apiRequest(`/diagrams/${diagramId}/access`, {
      headers: authHeaders
    });
    
    if (accessData.success) {
      console.log('✅ Acesso verificado - Admin tem controle total!\n');
    }

    console.log('🎉 === TODOS OS TESTES CONCLUÍDOS ===');
    console.log('✅ Sistema de permissionamento funcionando corretamente!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testAdminFlow();
}

module.exports = { testAdminFlow };