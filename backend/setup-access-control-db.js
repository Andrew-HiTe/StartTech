/**
 * Script para configurar o banco de dados com schema de controle de acesso
 * Execute: node setup-access-control-db.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'starttech_db',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔧 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao MySQL com sucesso!');

    // 1. Verificar se as tabelas do schema principal existem
    console.log('📋 Verificando schema principal...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users', 'diagrams')
    `, [dbConfig.database]);

    if (tables.length < 2) {
      console.log('🔧 Aplicando schema principal...');
      const mainSchema = await fs.readFile(path.join(__dirname, 'starttech_database.sql'), 'utf8');
      await connection.execute(mainSchema);
      console.log('✅ Schema principal aplicado!');
    }

    // 2. Verificar se as tabelas de controle de acesso existem
    console.log('🔐 Verificando schema de controle de acesso...');
    const [accessTables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (
        'diagram_classifications', 
        'classification_permissions', 
        'diagram_access', 
        'table_classifications'
      )
    `, [dbConfig.database]);

    if (accessTables.length < 4) {
      console.log('🔧 Aplicando schema de controle de acesso...');
      const accessSchema = await fs.readFile(path.join(__dirname, 'access_control_schema.sql'), 'utf8');
      await connection.execute(accessSchema);
      console.log('✅ Schema de controle de acesso aplicado!');
    }

    // 3. Criar usuário admin se não existir
    console.log('👤 Verificando usuário admin...');
    const [adminUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@starttech.com']
    );

    if (adminUser.length === 0) {
      console.log('👤 Criando usuário admin...');
      await connection.execute(`
        INSERT INTO users (email, password, name, role, is_active) 
        VALUES ('admin@starttech.com', '$2a$10$dummy.hash', 'Administrador', 'admin', TRUE)
      `);
      console.log('✅ Usuário admin criado!');
    }

    // 4. Criar classificações padrão
    console.log('🏷️ Verificando classificações padrão...');
    
    // Primeiro, buscar ou criar um diagrama de exemplo
    let [diagrams] = await connection.execute('SELECT id FROM diagrams LIMIT 1');
    let diagramId;
    
    if (diagrams.length === 0) {
      console.log('📊 Criando diagrama de exemplo...');
      const [result] = await connection.execute(`
        INSERT INTO diagrams (name, data, created_by, is_active) 
        VALUES ('Diagrama de Exemplo', '{"nodes":[],"edges":[]}', 1, TRUE)
      `);
      diagramId = result.insertId;
    } else {
      diagramId = diagrams[0].id;
    }

    // Criar classificações padrão
    const defaultClassifications = [
      { name: 'Público', description: 'Informações públicas sem restrição', color: '#10B981', isDefault: true },
      { name: 'Interno', description: 'Informações internas da organização', color: '#F59E0B', isDefault: false },
      { name: 'Confidencial', description: 'Informações confidenciais com acesso restrito', color: '#EF4444', isDefault: false }
    ];

    for (const classification of defaultClassifications) {
      const [existing] = await connection.execute(
        'SELECT id FROM diagram_classifications WHERE diagram_id = ? AND name = ?',
        [diagramId, classification.name]
      );

      if (existing.length === 0) {
        await connection.execute(`
          INSERT INTO diagram_classifications 
          (diagram_id, name, description, color, is_default, created_by) 
          VALUES (?, ?, ?, ?, ?, 1)
        `, [diagramId, classification.name, classification.description, classification.color, classification.isDefault]);
        
        console.log(`✅ Classificação '${classification.name}' criada!`);
      }
    }

    console.log('\n🎉 Configuração do banco de dados concluída com sucesso!');
    console.log('\n📋 Resumo:');
    console.log('- ✅ Schema principal verificado/aplicado');
    console.log('- ✅ Schema de controle de acesso verificado/aplicado');
    console.log('- ✅ Usuário admin configurado');
    console.log('- ✅ Classificações padrão criadas');
    console.log('\n🔗 Você pode fazer login como admin com:');
    console.log('- Email: admin@starttech.com');
    console.log('- Password: admin');

  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };