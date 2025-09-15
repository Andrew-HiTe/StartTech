-- Usar o banco existente 'teste'
USE teste;

-- Criar tabela principal para gerenciar diagramas
CREATE TABLE IF NOT EXISTS diagrams (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  table_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Mostrar tabelas existentes para confirmar
SHOW TABLES;

-- Mostrar estrutura da nova tabela
DESCRIBE diagrams;
