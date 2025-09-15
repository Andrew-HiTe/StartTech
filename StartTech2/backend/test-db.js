const db = require('./config/database');

setTimeout(() => {
  console.log('Testando conexão com banco...');
  
  // Verificar se a tabela usuarios existe
  db.query('SHOW TABLES LIKE "usuarios"', (err, results) => {
    if (err) {
      console.error('Erro ao verificar tabela:', err);
      process.exit(1);
    }
    
    if (results.length === 0) {
      console.log('❌ Tabela "usuarios" não existe!');
      console.log('Criando tabela...');
      
      db.query(`CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        senha VARCHAR(255) NOT NULL
      )`, (err) => {
        if (err) {
          console.error('Erro ao criar tabela:', err);
        } else {
          console.log('✅ Tabela "usuarios" criada com sucesso!');
          insertTestUser();
        }
      });
    } else {
      console.log('✅ Tabela "usuarios" existe!');
      checkUsers();
    }
  });
}, 1000);

function checkUsers() {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err);
    } else {
      console.log(`📊 Total de usuários: ${results.length}`);
      if (results.length > 0) {
        console.log('Usuários encontrados:');
        results.forEach(user => {
          console.log(`- ID: ${user.id}, Email: ${user.email}, Senha: ${user.senha.substring(0, 20)}...`);
        });
      } else {
        console.log('⚠️  Nenhum usuário encontrado. Inserindo usuário de teste...');
        insertTestUser();
      }
    }
    process.exit(0);
  });
}

function insertTestUser() {
  db.query('INSERT INTO usuarios (email, senha) VALUES (?, ?)', ['test@email.com', '123456'], (err, results) => {
    if (err) {
      console.error('Erro ao inserir usuário de teste:', err);
    } else {
      console.log('✅ Usuário de teste inserido com sucesso!');
      console.log('📧 Email: test@email.com');
      console.log('🔐 Senha: 123456');
    }
    process.exit(0);
  });
}
