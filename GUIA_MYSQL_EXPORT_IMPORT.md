# 🗄️ Guia Completo - Export/Import MySQL StartTech

## 🚀 Método Rápido (Script Automatizado)

### Exportar (Computador Origem):
```powershell
.\export_banco.ps1 -Acao export
```

### Importar (Computador Destino):
```powershell
.\export_banco.ps1 -Acao import -Arquivo backup_starttech_20250911_014642.sql
```

---

## 🔧 Comandos Manuais

### 📤 EXPORTAR (Computador Origem)

#### Comando Completo:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p starttech_db > backup_starttech.sql
```

#### Variações:
```powershell
# Export com estrutura e dados
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p --routines --triggers starttech_db > backup_completo.sql

# Export apenas estrutura (sem dados)
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p --no-data starttech_db > estrutura_only.sql

# Export apenas dados (sem estrutura)
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p --no-create-info starttech_db > dados_only.sql
```

### 📥 IMPORTAR (Computador Destino)

#### 1. Criar banco (se necessário):
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE starttech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 2. Importar dados:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p starttech_db < backup_starttech.sql
```

---

## 🔄 Alternativas de Transferência

### 1. **MySQL Workbench** (Interface Gráfica)
- **Export**: Server → Data Export → Selecionar schemas → Export to Self-Contained File
- **Import**: Server → Data Import → Import from Self-Contained File

### 2. **phpMyAdmin** (Web Interface)
- **Export**: Selecionar DB → Exportar → Executar
- **Import**: Selecionar DB → Importar → Escolher arquivo

### 3. **Usando Docker** (se disponível)
```bash
# Export
docker exec mysql_container mysqldump -u root -p starttech_db > backup.sql

# Import
docker exec -i mysql_container mysql -u root -p starttech_db < backup.sql
```

---

## 📋 Checklist de Transferência

### ✅ Antes do Export:
- [ ] Parar aplicação que usa o banco
- [ ] Verificar se há transações pendentes
- [ ] Confirmar usuário e senha MySQL
- [ ] Verificar espaço em disco para backup

### ✅ Durante Transferência:
- [ ] Copiar arquivo `.sql` via pen drive/nuvem/rede
- [ ] Verificar integridade do arquivo (tamanho)
- [ ] Confirmar MySQL instalado no destino

### ✅ Após Import:
- [ ] Verificar se todas as tabelas foram criadas
- [ ] Conferir dados importados
- [ ] Testar conexão da aplicação
- [ ] Atualizar configurações de conexão se necessário

---

## 🛡️ Configurações do StartTech

### Dados do Banco:
- **Nome**: `starttech_db`
- **Usuário**: `root` (padrão)
- **Host**: `localhost`
- **Porta**: `3306`

### Tabelas Principais:
- `users` - Usuários do sistema
- `projects` - Projetos/diagramas
- `diagrams` - Dados dos diagramas
- `audit_log` - Log de auditoria

### Arquivo de Config Backend:
```javascript
// backend/server.js
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Sua senha aqui
  database: 'starttech_db',
  port: 3306
};
```

---

## 🔧 Troubleshooting

### Erro: "mysqldump não reconhecido"
```powershell
# Usar caminho completo
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p starttech_db > backup.sql
```

### Erro: "Access denied"
- Verificar usuário e senha
- Confirmar permissões do usuário
- Tentar com usuário `root`

### Erro: "Database doesn't exist"
```sql
-- Criar banco antes do import
CREATE DATABASE starttech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Arquivo muito grande
```powershell
# Comprimir backup
Compress-Archive -Path backup_starttech.sql -DestinationPath backup_starttech.zip
```

---

## 🎯 Comandos Rápidos

```powershell
# Export rápido
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p starttech_db > backup.sql

# Import rápido
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p starttech_db < backup.sql

# Verificar se funcionou
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "USE starttech_db; SHOW TABLES;"
```
