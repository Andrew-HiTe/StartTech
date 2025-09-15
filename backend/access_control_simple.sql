-- ====================================================
-- Schema Simplificado de Controle de Acesso Granular
-- ====================================================

-- Tabela de classificações por diagrama
CREATE TABLE IF NOT EXISTS diagram_classifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagram_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    display_order INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_diagram_classifications (diagram_id),
    INDEX idx_diagram_active (diagram_id, is_active)
);

-- Tabela de permissões por classificação  
CREATE TABLE IF NOT EXISTS classification_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    classification_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    permission_type ENUM('view', 'edit', 'admin') DEFAULT 'view',
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_classification_permissions (classification_id),
    INDEX idx_user_permissions (user_email),
    FOREIGN KEY (classification_id) REFERENCES diagram_classifications(id) ON DELETE CASCADE
);

-- Tabela de acesso a diagramas
CREATE TABLE IF NOT EXISTS diagram_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagram_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    access_level ENUM('view', 'edit', 'admin', 'owner') DEFAULT 'view',
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_diagram_access (diagram_id),
    INDEX idx_user_diagram_access (user_email, diagram_id),
    UNIQUE KEY unique_user_diagram (diagram_id, user_email)
);

-- Tabela de classificações de tabelas
CREATE TABLE IF NOT EXISTS table_classifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagram_id INT NOT NULL,
    table_node_id VARCHAR(100) NOT NULL,
    classification_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_table_classifications (diagram_id, table_node_id),
    INDEX idx_classification_tables (classification_id),
    FOREIGN KEY (classification_id) REFERENCES diagram_classifications(id) ON DELETE CASCADE,
    UNIQUE KEY unique_table_classification (diagram_id, table_node_id)
);

-- Inserir classificações padrão para diagrama de teste (ID 1)
INSERT IGNORE INTO diagram_classifications (diagram_id, name, description, color, display_order, is_default) VALUES
(1, 'Público', 'Tabelas visíveis para todos os usuários', '#10B981', 1, TRUE),
(1, 'Privado', 'Tabelas visíveis apenas para o proprietário', '#EF4444', 2, FALSE),
(1, 'Corporativo', 'Tabelas visíveis para usuários da empresa', '#3B82F6', 3, FALSE),
(1, 'Confidencial', 'Tabelas com acesso muito restrito', '#8B5CF6', 4, FALSE);

-- Conceder acesso total ao admin no diagrama de teste
INSERT IGNORE INTO diagram_access (diagram_id, user_email, access_level, granted_by) VALUES
(1, 'admin@starttech.com', 'owner', 1),
(1, 'editor@starttech.com', 'edit', 1),
(1, 'reader@starttech.com', 'view', 1);

-- Conceder permissões padrão nas classificações
INSERT IGNORE INTO classification_permissions (classification_id, user_email, permission_type, granted_by)
SELECT id, 'admin@starttech.com', 'admin', 1 FROM diagram_classifications WHERE diagram_id = 1;

INSERT IGNORE INTO classification_permissions (classification_id, user_email, permission_type, granted_by)
SELECT id, 'editor@starttech.com', 'edit', 1 FROM diagram_classifications WHERE diagram_id = 1 AND name IN ('Público', 'Corporativo');

INSERT IGNORE INTO classification_permissions (classification_id, user_email, permission_type, granted_by)
SELECT id, 'reader@starttech.com', 'view', 1 FROM diagram_classifications WHERE diagram_id = 1 AND name = 'Público';