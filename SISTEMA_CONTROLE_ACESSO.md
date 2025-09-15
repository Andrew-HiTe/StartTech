# Sistema de Controle de Acesso Granular - StartTech

## 📋 Visão Geral

Implementação de um sistema completo de controle de acesso granular para diagramas C4, permitindo:
- **Classificações personalizadas** por diagrama (ex: Público, Restrito, Confidencial)
- **Permissões por e-mail** para cada classificação
- **Controle de acesso por diagrama** (quem pode acessar cada projeto)
- **Filtragem automática** de tabelas visíveis baseada nas permissões do usuário

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

1. **`diagram_classifications`** - Classificações personalizadas por diagrama
2. **`classification_permissions`** - Permissões específicas por e-mail para cada classificação
3. **`diagram_access`** - Controle de acesso geral ao diagrama por usuário
4. **`table_classifications`** - Classificação atribuída a cada tabela/nó do diagrama

### Instalação do Schema

```bash
# 1. Execute o script SQL no MySQL
mysql -u root -p starttech_db < backend/access_control_schema.sql

# 2. Reinicie o servidor backend
cd backend
npm start
```

## 🚀 Como Usar

### 1. Configurar Acesso ao Diagrama

1. **Abra um diagrama** (você deve ser o dono)
2. **Clique no botão "🔐 Configurar Acesso"** na toolbar
3. **Na aba "Acesso ao Diagrama":**
   - Adicione usuários pelo e-mail
   - Defina nível de acesso: `view`, `edit` ou `admin`

### 2. Criar Classificações Personalizadas

1. **Na aba "🏷️ Classificações":**
   - Crie classificações como "Público", "Restrito", "Confidencial"
   - Defina cores para cada classificação
   - Marque uma como padrão

### 3. Configurar Permissões por Classificação

1. **Na aba "🔐 Permissões por Classificação":**
   - Selecione uma classificação
   - Adicione e-mails de usuários
   - Defina tipo de permissão: `view`, `edit` ou `admin`

### 4. Classificar Tabelas

1. **Selecione uma tabela** no diagrama
2. **Use o dropdown de classificação** que aparece
3. **Escolha a classificação** apropriada
4. A tabela será **colorida** conforme a classificação

## 🔐 Níveis de Permissão

### Acesso ao Diagrama
- **`view`** - Pode visualizar (limitado pelas classificações)
- **`edit`** - Pode editar (limitado pelas classificações)
- **`admin`** - Acesso total exceto configurar acesso

### Permissões por Classificação
- **`view`** - Pode ver tabelas desta classificação
- **`edit`** - Pode editar tabelas desta classificação
- **`admin`** - Controle total sobre esta classificação

### Hierarquia
1. **Dono do Diagrama** - Controle total
2. **Admin do Diagrama** - Pode tudo exceto configurar acesso
3. **Editor com permissões específicas** - Limitado às classificações
4. **Visualizador com permissões específicas** - Apenas visualização limitada

## 🔧 Endpoints da API

### Classificações
```bash
GET    /api/diagrams/:id/classifications
POST   /api/diagrams/:id/classifications
PUT    /api/classifications/:id
DELETE /api/classifications/:id
```

### Permissões
```bash
GET    /api/classifications/:id/permissions
POST   /api/classifications/:id/permissions
DELETE /api/classifications/:id/permissions/:email
```

### Acesso ao Diagrama
```bash
GET    /api/diagrams/:id/access
POST   /api/diagrams/:id/access
GET    /api/diagrams/:id/my-permissions
```

### Classificação de Tabelas
```bash
PUT    /api/diagrams/:id/tables/:nodeId/classification
```

## 🧪 Cenários de Teste

### 1. Teste Básico de Classificação

1. **Crie um diagrama** com algumas tabelas
2. **Configure classificações:** "Público" (padrão) e "Restrito"
3. **Classifique algumas tabelas** como "Restrito"
4. **Adicione um usuário** com acesso apenas à classificação "Público"
5. **Faça login com esse usuário** - deve ver apenas tabelas públicas

### 2. Teste de Permissões Granulares

1. **Crie classificações:** "Frontend", "Backend", "Database"
2. **Classifique tabelas** conforme sua função
3. **Adicione usuários específicos:**
   - `frontend@empresa.com` - acesso apenas a "Frontend"
   - `fullstack@empresa.com` - acesso a "Frontend" e "Backend"
   - `dba@empresa.com` - acesso apenas a "Database"
4. **Teste cada usuário** e valide visibilidade

### 3. Teste de Hierarquia

1. **Configure usuário como editor** do diagrama
2. **Adicione permissões específicas** para algumas classificações
3. **Teste se pode editar** apenas classificações permitidas
4. **Verifique se não pode configurar acesso** (só dono pode)

## 🐛 Troubleshooting

### Erro: "Acesso Negado"
- Verifique se o usuário tem acesso ao diagrama
- Confirme se o e-mail está correto na configuração

### Tabelas Não Aparecem
- Verifique se o usuário tem permissão para a classificação
- Confirme se a classificação está ativa
- Verifique se a tabela tem classificação atribuída

### Modal Não Carrega
- Confirme se o usuário é dono do diagrama
- Verifique se as tabelas do banco foram criadas
- Confira logs do backend para erros de API

### Permissões Não Funcionam
- Execute `loadUserPermissions()` manualmente no console
- Verifique se o token JWT está válido
- Confirme se os dados estão sendo salvos no banco

## 📊 Logs e Debug

### Frontend (Console)
```javascript
// Verificar permissões carregadas
useDiagramStore.getState().userPermissions

// Verificar nós visíveis
useDiagramStore.getState().getVisibleNodes()

// Recarregar permissões
useDiagramStore.getState().loadUserPermissions(diagramId)
```

### Backend (Logs)
```bash
# Os logs mostram:
✅ Permissões do usuário carregadas
❌ Erro ao carregar classificações
🔐 Sistema de controle de acesso ativo
```

## 🔄 Fluxo Completo

1. **Dono cria diagrama** → Recebe classificações padrão
2. **Dono personaliza classificações** → Define cores e nomes
3. **Dono classifica tabelas** → Atribui classificação a cada tabela
4. **Dono configura acesso** → Adiciona usuários e permissões
5. **Usuários acessam** → Veem apenas tabelas permitidas
6. **Sistema filtra automaticamente** → Tabelas e conexões ocultas

## 📝 Próximos Passos

- [ ] Cache de permissões no frontend
- [ ] Notificações de mudanças de acesso
- [ ] Auditoria de acessos
- [ ] Grupos de usuários
- [ ] Permissões temporárias com expiração
- [ ] Templates de classificação

---

**Criado em:** 14 de Setembro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Implementação Completa