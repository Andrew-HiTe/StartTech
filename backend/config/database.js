/**
 * Configuração da conexão com o banco de dados MySQL para T-Draw
 * Estabelece a conexão com o banco utilizando credenciais
 * do arquivo .env ou valores padrão como fallback
 */

const mysql = require('mysql2');

// Carrega variáveis de ambiente se o dotenv estiver disponível
try {
  require('dotenv').config();
} catch (err) {
  console.log('dotenv não encontrado, usando valores padrão');
}

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'teste'
});

// Exportar a versão com promises para usar async/await
const db = connection.promise();

connection.connect(async (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL - T-Draw');
  
  // Criar tabela diagrams automaticamente
  try {
    const createDiagramsTableQuery = `
      CREATE TABLE IF NOT EXISTS diagrams (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        table_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await db.execute(createDiagramsTableQuery);
    console.log('✅ Tabela diagrams verificada/criada');
  } catch (error) {
    console.error('❌ Erro ao criar tabela diagrams:', error);
  }
  
  // Criar tabela principal novamente para garantir
  try {
    const createDiagramsTableQuery2 = `
      CREATE TABLE IF NOT EXISTS diagrams (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        table_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await db.execute(createDiagramsTableQuery2);
    console.log('✅ Tabela diagrams verificada/criada na inicialização');
  } catch (error) {
    console.error('❌ Erro ao criar tabela diagrams na inicialização:', error);
  }
});

module.exports = db;
