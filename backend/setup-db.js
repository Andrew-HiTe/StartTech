/**
 * Script para criar o banco de dados StartTech
 * Execute este arquivo para configurar o schema inicial
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    // Conectar sem especificar database (para criar)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔗 Conectado ao MySQL');

    // Criar database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'starttech_db'}`);
    console.log('✅ Database criado/verificado');

    // Fechar conexão atual e reconectar com o database
    await connection.end();
    
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'starttech_db',
      port: process.env.DB_PORT || 3306
    };
    
    connection = await mysql.createConnection(dbConfig);

    // Criar tabela de usuários
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'editor', 'reader') DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela users criada');

    // Criar tabela de diagramas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS diagrams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        data JSON NOT NULL,
        version INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela diagrams criada');

    // Inserir usuário admin de teste
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    await connection.execute(`
      INSERT IGNORE INTO users (email, password, name, role) 
      VALUES ('admin@starttech.com', ?, 'Administrador', 'admin')
    `, [hashedPassword]);
    console.log('✅ Usuário admin criado: admin@starttech.com / admin');

    // Inserir usuário editor de teste
    const editorPassword = await bcrypt.hash('editor', 10);
    await connection.execute(`
      INSERT IGNORE INTO users (email, password, name, role) 
      VALUES ('editor@starttech.com', ?, 'Editor', 'editor')
    `, [editorPassword]);
    console.log('✅ Usuário editor criado: editor@starttech.com / editor');

    // Inserir usuário leitor de teste
    const readerPassword = await bcrypt.hash('reader', 10);
    await connection.execute(`
      INSERT IGNORE INTO users (email, password, name, role) 
      VALUES ('reader@starttech.com', ?, 'Leitor', 'reader')
    `, [readerPassword]);
    console.log('✅ Usuário leitor criado: reader@starttech.com / reader');

    console.log('\n🎉 Setup do banco concluído com sucesso!');
    console.log('📝 Usuários de teste criados:');
    console.log('   • admin@starttech.com (senha: admin)');
    console.log('   • editor@starttech.com (senha: editor)');
    console.log('   • reader@starttech.com (senha: reader)');

  } catch (error) {
    console.error('❌ Erro no setup:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Dicas para resolver:');
      console.log('1. Verifique se o MySQL está rodando');
      console.log('2. Confira as credenciais no arquivo .env');
      console.log('3. Tente: mysql -u root -p');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexão encerrada');
    }
  }
}

// Executar setup
setupDatabase();
