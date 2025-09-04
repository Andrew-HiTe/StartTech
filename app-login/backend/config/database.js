/**
 * Configuração da conexão com o banco de dados MySQL
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

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'teste'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

module.exports = db;