const mysql = require('mysql2');
require('dotenv').config();

// Configuração do banco de dados
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
  
  // Primeiro, vamos listar todas as tabelas
  db.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Erro ao listar tabelas:', err);
      return;
    }
    console.log('Tabelas no banco:', results);
    
    // Agora vamos verificar a estrutura da tabela usuarios
    db.query('DESCRIBE usuarios', (err, results) => {
      if (err) {
        console.error('Erro ao descrever tabela usuarios:', err);
        return;
      }
      console.log('Estrutura da tabela usuarios:', results);
      
      // Finalmente, vamos buscar todos os emails
      db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) {
          console.error('Erro ao buscar usuários:', err);
          return;
        }
        console.log('Todos os usuários:', results);
        
        // Teste específico para test@email.com
        db.query('SELECT * FROM usuarios WHERE email = ?', ['test@email.com'], (err, results) => {
          if (err) {
            console.error('Erro ao buscar test@email.com:', err);
            return;
          }
          console.log('Resultado para test@email.com:', results);
          db.end();
        });
      });
    });
  });
});
