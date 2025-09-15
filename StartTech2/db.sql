CREATE DATABASE teste

USE teste;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL
);

-- Tabela principal para gerenciar diagramas
CREATE TABLE diagrams (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  table_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Exemplo: Para cada diagrama criado, uma tabela específica será criada dinamicamente
-- Estrutura padrão das tabelas de diagrama (criadas dinamicamente):
/*
CREATE TABLE diagram_[id] (
  id VARCHAR(255) PRIMARY KEY,
  node_name VARCHAR(255) NOT NULL,
  node_type VARCHAR(100) DEFAULT 'table',
  node_description TEXT,
  position_x DECIMAL(10,2),
  position_y DECIMAL(10,2),
  style_width INT,
  style_height INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
*/

INSERT INTO usuarios (email, senha) VALUES ('test@email.com', '123456');

SELECT * FROM usuarios;

TRUNCATE TABLE usuarios;

DELETE FROM usuarios;






DROP TABLE usuarios;