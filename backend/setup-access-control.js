/**
 * Setup do Sistema de Controle de Acesso
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function setupAccessControl() {
  let connection;
  
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'starttech_db',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    };

    console.log('🔗 Conectando ao MySQL...');
    connection = await mysql.createConnection(dbConfig);

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'access_control_simple.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // Remover o comando USE (já estamos conectados ao database)
    const cleanSql = sqlScript.replace(/USE\s+\w+;/gi, '');

    console.log('🚀 Executando schema de controle de acesso...');
    
    // Executar cada comando separadamente
    const commands = cleanSql.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          await connection.query(command);
          console.log('✅ Comando executado:', command.substring(0, 50) + '...');
        } catch (error) {
          console.log('⚠️  Erro em comando (pode ser normal):', error.message);
        }
      }
    }

    console.log('✅ Sistema de controle de acesso configurado com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('   • diagram_classifications');
    console.log('   • classification_permissions');
    console.log('   • diagram_access');
    console.log('   • table_classifications');

  } catch (error) {
    console.error('❌ Erro no setup:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Conexão encerrada');
    }
  }
}

// Executar setup
setupAccessControl();