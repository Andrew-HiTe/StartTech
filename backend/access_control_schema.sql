-- ====================================================
-- Schema de Controle de Acesso Granular
-- Sistema de classificações e permissões por tabela/diagrama
-- ====================================================

USE starttech_db;

-- ====================================================
-- TABELA DE CLASSIFICAÇÕES POR DIAGRAMA
-- Cada diagrama pode ter suas próprias classificações personalizadas
-- ====================================================
CREATE TABLE diagram_classifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagram_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    display_order INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Chaves estrangeiras
    FOREIGN KEY (diagram_id) REFERENCES diagrams(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Índices e constraints
    UNIQUE KEY unique_diagram_classification (diagram_id, name),
    INDEX idx_diagram (diagram_id),
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABELA DE PERMISSÕES DE ACESSO POR CLASSIFICAÇÃO
-- Define quais usuários podem ver tabelas de cada classificação
-- ====================================================
CREATE TABLE classification_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    classification_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    permission_type ENUM('view', 'edit', 'admin') DEFAULT 'view',
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Chaves estrangeiras
    FOREIGN KEY (classification_id) REFERENCES diagram_classifications(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Índices e constraints
    UNIQUE KEY unique_classification_user (classification_id, user_email),
    INDEX idx_classification (classification_id),
    INDEX idx_user_email (user_email),
    INDEX idx_active (is_active),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABELA DE ACESSO A DIAGRAMAS
-- Define quais usuários podem acessar cada diagrama
-- ====================================================
CREATE TABLE diagram_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagram_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    access_level ENUM('view', 'edit', 'admin') DEFAULT 'view',
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Chaves estrangeiras
    FOREIGN KEY (diagram_id) REFERENCES diagrams(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Índices e constraints
    UNIQUE KEY unique_diagram_user (diagram_id, user_email),
    INDEX idx_diagram (diagram_id),
    INDEX idx_user_email (user_email),
    INDEX idx_access_level (access_level),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- TABELA DE CLASSIFICAÇÃO DAS TABELAS NO DIAGRAMA
-- Armazena qual classificação cada tabela/nó possui
-- ====================================================
CREATE TABLE table_classifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    diagram_id INT NOT NULL,
    table_node_id VARCHAR(100) NOT NULL, -- ID do nó no React Flow
    classification_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Chaves estrangeiras
    FOREIGN KEY (diagram_id) REFERENCES diagrams(id) ON DELETE CASCADE,
    FOREIGN KEY (classification_id) REFERENCES diagram_classifications(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Índices e constraints
    UNIQUE KEY unique_table_classification (diagram_id, table_node_id),
    INDEX idx_diagram (diagram_id),
    INDEX idx_table_node (table_node_id),
    INDEX idx_classification (classification_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- INSERIR CLASSIFICAÇÕES PADRÃO PARA TESTES
-- ====================================================

-- Função para inserir classificações padrão em novos diagramas
DELIMITER $$

CREATE TRIGGER after_diagram_insert 
    AFTER INSERT ON diagrams
    FOR EACH ROW
BEGIN
    -- Inserir classificações padrão para o novo diagrama
    INSERT INTO diagram_classifications (diagram_id, name, description, color, display_order, is_default, created_by) VALUES
    (NEW.id, 'Público', 'Visível para todos os usuários com acesso ao diagrama', '#10B981', 1, TRUE, NEW.user_id),
    (NEW.id, 'Restrito', 'Visível apenas para usuários específicos', '#F59E0B', 2, FALSE, NEW.user_id),
    (NEW.id, 'Confidencial', 'Visível apenas para administradores e usuários autorizados', '#EF4444', 3, FALSE, NEW.user_id);
END$$

DELIMITER ;

-- ====================================================
-- VIEWS PARA CONSULTAS OTIMIZADAS
-- ====================================================

-- View para consultar permissões efetivas de um usuário
CREATE VIEW user_effective_permissions AS
SELECT 
    da.diagram_id,
    da.user_email,
    da.access_level as diagram_access,
    dc.id as classification_id,
    dc.name as classification_name,
    dc.color as classification_color,
    COALESCE(cp.permission_type, 
        CASE 
            WHEN da.access_level = 'admin' THEN 'admin'
            WHEN da.access_level = 'edit' THEN 'edit'
            WHEN dc.is_default = TRUE THEN 'view'
            ELSE NULL
        END
    ) as classification_permission,
    tc.table_node_id
FROM diagram_access da
LEFT JOIN diagrams d ON da.diagram_id = d.id
LEFT JOIN diagram_classifications dc ON d.id = dc.diagram_id AND dc.is_active = TRUE
LEFT JOIN classification_permissions cp ON dc.id = cp.classification_id AND cp.user_email = da.user_email AND cp.is_active = TRUE
LEFT JOIN table_classifications tc ON dc.id = tc.classification_id AND tc.is_active = TRUE
WHERE da.is_active = TRUE 
    AND (da.expires_at IS NULL OR da.expires_at > NOW())
    AND (cp.expires_at IS NULL OR cp.expires_at > NOW());

-- View para configurações de acesso por diagrama
CREATE VIEW diagram_access_config AS
SELECT 
    d.id as diagram_id,
    d.name as diagram_name,
    d.user_id as owner_id,
    u.email as owner_email,
    COUNT(DISTINCT da.user_email) as users_with_access,
    COUNT(DISTINCT dc.id) as total_classifications,
    COUNT(DISTINCT cp.user_email) as users_with_specific_permissions
FROM diagrams d
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN diagram_access da ON d.id = da.diagram_id AND da.is_active = TRUE
LEFT JOIN diagram_classifications dc ON d.id = dc.diagram_id AND dc.is_active = TRUE
LEFT JOIN classification_permissions cp ON dc.id = cp.classification_id AND cp.is_active = TRUE
WHERE d.is_active = TRUE
GROUP BY d.id, d.name, d.user_id, u.email;

-- ====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ====================================================

-- Índice composto para consultas frequentes de permissão
CREATE INDEX idx_permission_lookup ON classification_permissions (user_email, classification_id, is_active);

-- Índice para consultas de tabelas por diagrama
CREATE INDEX idx_table_diagram_lookup ON table_classifications (diagram_id, is_active, table_node_id);

-- Índice para consultas de acesso por usuário
CREATE INDEX idx_user_access_lookup ON diagram_access (user_email, is_active, access_level);

-- ====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ====================================================

-- Adicionar comentários nas tabelas para documentação
ALTER TABLE diagram_classifications COMMENT = 'Classificações personalizadas por diagrama (ex: Público, Restrito, Confidencial)';
ALTER TABLE classification_permissions COMMENT = 'Permissões específicas por e-mail para cada classificação';
ALTER TABLE diagram_access COMMENT = 'Controle de acesso geral ao diagrama por usuário';
ALTER TABLE table_classifications COMMENT = 'Classificação atribuída a cada tabela/nó do diagrama';

-- ====================================================
-- DADOS DE EXEMPLO PARA DESENVOLVIMENTO
-- ====================================================

-- Inserir alguns usuários de exemplo (caso não existam)
INSERT IGNORE INTO users (email, password, name, role) VALUES
('admin@starttech.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin'),
('editor@starttech.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Editor', 'editor'),
('viewer@starttech.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Visualizador', 'reader');