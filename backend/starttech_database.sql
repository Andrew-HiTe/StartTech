-- ====================================================
-- Script SQL para criar banco StartTech
-- Execute no seu cliente MySQL (phpMyAdmin, Workbench, etc.)
-- ====================================================

-- 1. Criar o banco de dados (descomente se necessário)
-- CREATE DATABASE starttech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Usar o banco de dados
USE starttech_db;

-- ====================================================
-- TABELA DE USUÁRIOS
-- ====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'reader') DEFAULT 'editor',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABELA DE PROJETOS/DIAGRAMAS
-- ====================================================
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Chaves estrangeiras
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Índices
    INDEX idx_owner (owner_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABELA DE DIAGRAMAS (compatível com código atual)
-- ====================================================
CREATE TABLE diagrams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NULL, -- Pode ser NULL para backward compatibility
    name VARCHAR(255) NOT NULL,
    data JSON NOT NULL,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Chaves estrangeiras
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    -- Índices
    INDEX idx_user (user_id),
    INDEX idx_project (project_id),
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABELA DE PERMISSÕES POR PROJETO
-- ====================================================
CREATE TABLE project_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    role ENUM('admin', 'editor', 'reader') NOT NULL,
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    -- Chaves estrangeiras
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE RESTRICT,
    -- Índices e constraints
    UNIQUE KEY unique_user_project (user_id, project_id),
    INDEX idx_project (project_id),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABELA DE TABELAS DO DIAGRAMA
-- ====================================================
CREATE TABLE diagram_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    diagram_id INT NULL,
    name VARCHAR(255) NOT NULL,
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    width FLOAT DEFAULT 200,
    height FLOAT DEFAULT 150,
    columns JSON NOT NULL,
    style JSON NULL,
    created_by INT NOT NULL,
    updated_by INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Chaves estrangeiras
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (diagram_id) REFERENCES diagrams(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    -- Índices
    INDEX idx_project (project_id),
    INDEX idx_diagram (diagram_id),
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABELA DE CONEXÕES ENTRE TABELAS
-- ====================================================
CREATE TABLE table_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    source_table_id INT NOT NULL,
    target_table_id INT NOT NULL,
    source_column VARCHAR(255) NOT NULL,
    target_column VARCHAR(255) NOT NULL,
    connection_type ENUM('one_to_one', 'one_to_many', 'many_to_many') DEFAULT 'one_to_many',
    style JSON NULL,
    created_by INT NOT NULL,
    updated_by INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Chaves estrangeiras
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (source_table_id) REFERENCES diagram_tables(id) ON DELETE CASCADE,
    FOREIGN KEY (target_table_id) REFERENCES diagram_tables(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    -- Índices
    INDEX idx_project (project_id),
    INDEX idx_source (source_table_id),
    INDEX idx_target (target_table_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABELA DE LOG DE AUDITORIA
-- ====================================================
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    action VARCHAR(100) NOT NULL,
    old_data JSON NULL,
    new_data JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Chaves estrangeiras
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    -- Índices
    INDEX idx_user (user_id),
    INDEX idx_project (project_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- DADOS DE TESTE
-- ====================================================

-- Inserir usuários de teste
INSERT INTO users (email, password, name, role) VALUES
-- Senhas são bcrypt hash de 'admin', 'editor', 'reader' respectivamente
('admin@starttech.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin'),
('editor@starttech.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Editor Principal', 'editor'),
('reader@starttech.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Leitor', 'reader'),
('user@starttech.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Usuário Teste', 'editor');

-- Inserir projeto de exemplo
INSERT INTO projects (name, description, owner_id) VALUES
('Sistema ERP', 'Diagrama do sistema ERP principal da empresa', 1),
('API Gateway', 'Arquitetura da API Gateway', 1);

-- Inserir diagrama de exemplo
INSERT INTO diagrams (user_id, project_id, name, data) VALUES
(1, 1, 'Diagrama Principal', '{"nodes": [], "edges": []}');

-- ====================================================
-- VIEWS ÚTEIS
-- ====================================================

-- View para listar usuários com contagem de projetos
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.is_active,
    COUNT(DISTINCT p.id) as project_count,
    COUNT(DISTINCT d.id) as diagram_count,
    u.created_at
FROM users u
LEFT JOIN projects p ON u.id = p.owner_id
LEFT JOIN diagrams d ON u.id = d.user_id
GROUP BY u.id;

-- View para listar projetos com informações do owner
CREATE VIEW project_details AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.is_active,
    u.name as owner_name,
    u.email as owner_email,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT d.id) as diagram_count
FROM projects p
JOIN users u ON p.owner_id = u.id
LEFT JOIN diagrams d ON p.id = d.project_id
GROUP BY p.id;

-- ====================================================
-- TRIGGERS PARA AUDITORIA AUTOMÁTICA
-- ====================================================

DELIMITER //

-- Trigger para auditoria de usuários
CREATE TRIGGER audit_users_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, entity_type, entity_id, action, old_data, new_data)
    VALUES (NEW.id, 'user', NEW.id, 'UPDATE', 
            JSON_OBJECT('email', OLD.email, 'name', OLD.name, 'role', OLD.role),
            JSON_OBJECT('email', NEW.email, 'name', NEW.name, 'role', NEW.role));
END//

-- Trigger para auditoria de projetos
CREATE TRIGGER audit_projects_insert
AFTER INSERT ON projects
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, project_id, entity_type, entity_id, action, new_data)
    VALUES (NEW.owner_id, NEW.id, 'project', NEW.id, 'CREATE',
            JSON_OBJECT('name', NEW.name, 'description', NEW.description));
END//

DELIMITER ;

-- ====================================================
-- FINALIZAÇÃO
-- ====================================================

-- Mostrar estatísticas das tabelas criadas
SELECT 
    TABLE_NAME as 'Tabela',
    TABLE_ROWS as 'Registros',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Tamanho (MB)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- Mostrar usuários criados
SELECT id, email, name, role, created_at FROM users;

-- ====================================================
-- QUERIES ÚTEIS PARA DESENVOLVIMENTO
-- ====================================================

/*
-- Para limpar todas as tabelas (cuidado!)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE audit_log;
-- TRUNCATE table_connections;
-- TRUNCATE diagram_tables;
-- TRUNCATE project_permissions;
-- TRUNCATE diagrams;
-- TRUNCATE projects;
-- TRUNCATE users;
-- SET FOREIGN_KEY_CHECKS = 1;

-- Para resetar auto_increment
-- ALTER TABLE users AUTO_INCREMENT = 1;

-- Para ver estrutura de uma tabela
-- DESCRIBE users;

-- Para ver índices de uma tabela
-- SHOW INDEX FROM users;
*/

COMMIT;
