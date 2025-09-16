# 🎯 StartTech - Sistema de Diagramas Inteligentes

> **Projeto de finalização da imersão Start-Tech edição Cloud**

Um sistema completo para criação, edição e gerenciamento colaborativo de diagramas C4, desenvolvido com tecnologias modernas e arquitetura fullstack.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.17-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

## 📋 Sobre o Projeto

O **StartTech** é uma plataforma web completa para criação e gerenciamento de diagramas arquiteturais, especialmente focada no modelo C4 (Context, Containers, Components, Code). O sistema oferece uma interface intuitiva para desenhar diagramas, gerenciar projetos e colaborar em equipe.

### 🎯 Características Principais

- **🎨 Editor Visual Avançado**: Interface drag-and-drop com React Flow
- **👥 Gestão de Usuários**: Sistema completo de autenticação e autorização
- **🔐 Controle de Acesso**: Gerenciamento granular de permissões por projeto
- **💾 Persistência Inteligente**: Salvamento automático e versionamento
- **📱 Design Responsivo**: Interface adaptável para desktop e mobile
- **🚀 Performance Otimizada**: Carregamento rápido com Vite e chunks otimizados

## 🛠️ Stack Tecnológica

### Frontend
- **React 19.1.1** - Framework JavaScript moderno
- **@xyflow/react 12.8.4** - Editor de diagramas interativo
- **React Router DOM 7.8.2** - Roteamento SPA
- **Zustand 5.0.8** - Gerenciamento de estado
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **Vite 7.1.2** - Build tool e dev server

### Backend
- **Node.js + Express 5.1.0** - Servidor web
- **MySQL 8.0** - Banco de dados relacional
- **JWT** - Autenticação segura
- **bcryptjs** - Hash de senhas
- **CORS** - Controle de acesso cross-origin

### DevOps
- **ESLint** - Linting e qualidade de código
- **Nodemon** - Hot reload para desenvolvimento
- **Concurrently** - Execução paralela de scripts

## 🚀 Funcionalidades

### 🏠 **Landing Page**
- Apresentação do produto com design moderno
- Call-to-action para cadastro/login
- Seção de funcionalidades e benefícios

### 🔐 **Sistema de Autenticação**
- Login/logout seguro com JWT
- Validação de credenciais
- Proteção de rotas privadas
- Session management

### 📊 **Editor de Diagramas**
- **Criação de Nós**: Componentes, containers, sistemas
- **Conexões Inteligentes**: Links automáticos entre elementos
- **Toolbar Completa**: Ferramentas de edição e formatação
- **Sidebar Organizacional**: Lista de projetos e diagramas
- **Export/Import**: Salvar e carregar diagramas
- **Zoom e Pan**: Navegação fluida pela área de trabalho

### 👥 **Gerenciamento de Projetos**
- **Criação de Projetos**: Organização por contexto
- **Controle de Acesso**: Admin, Editor, Reader
- **Compartilhamento**: Convites para colaboração
- **Histórico**: Auditoria de mudanças

### ⚙️ **Administração**
- **Dashboard**: Visão geral de projetos e usuários
- **Gerenciamento de Usuários**: CRUD completo
- **Logs de Auditoria**: Rastreabilidade de ações
- **Configurações**: Personalização do sistema

## 📁 Estrutura do Projeto

```
StartTech/
├── 📁 backend/              # Servidor Node.js
│   ├── server.js           # Ponto de entrada do servidor
│   ├── setup-db.js         # Script de inicialização do DB
│   └── starttech_database.sql # Schema do banco
├── 📁 src/                  # Código React
│   ├── 📁 components/       # Componentes React
│   │   ├── 📁 auth/         # Autenticação
│   │   ├── 📁 diagram/      # Editor de diagramas
│   │   ├── 📁 home/         # Landing page
│   │   └── 📁 shared/       # Componentes reutilizáveis
│   ├── 📁 hooks/            # Custom hooks
│   ├── 📁 stores/           # Gerenciamento de estado
│   ├── 📁 styles/           # Estilos CSS
│   └── 📁 routing/          # Configuração de rotas
├── 📁 docs/                 # Documentação técnica
├── 📁 public/               # Assets estáticos
└── 📄 package.json          # Dependências e scripts
```

## ⚡ Quick Start

### Pré-requisitos

- **Node.js** 18+ 
- **MySQL** 8.0+
- **Git**

### 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/Andrew-HiTe/StartTech.git
cd StartTech
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# Configure suas credenciais MySQL no backend/.env
npm run setup-db
```

4. **Execute o projeto**
```bash
# Modo desenvolvimento completo (frontend + backend)
npm run dev:full

# Ou separadamente:
npm run dev        # Frontend (porta 5173)
npm run backend:dev # Backend (porta 3001)
```

5. **Acesse a aplicação**
```
Frontend: http://localhost:5173
Backend API: http://localhost:3001
```

### 🔐 Configuração do Ambiente

Crie um arquivo `.env` na pasta `backend/`:

```env
# Banco de dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=starttech_db

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Servidor
PORT=3001
NODE_ENV=development
```

## 📖 Como Usar

### 1. **Acesso Inicial**
- Acesse `http://localhost:5173`
- Cadastre-se ou faça login
- Será redirecionado para o dashboard

### 2. **Criando um Diagrama**
- Clique em "Novo Projeto"
- Dê um nome e descrição
- Use a toolbar para adicionar elementos
- Conecte componentes arrastando das bordas
- Salve automaticamente

### 3. **Colaboração**
- Acesse "Gerenciar Acessos"
- Convide usuários por email
- Defina permissões (Admin/Editor/Reader)
- Colabore em tempo real

### 4. **Exportação**
- Use o botão "Export" na toolbar
- Escolha formato (JSON, PNG, SVG)
- Faça download ou compartilhe

## 🎨 Capturas de Tela

*(Adicione screenshots da aplicação aqui)*

## 🚧 Roadmap

- [ ] **v2.0**: Colaboração em tempo real (WebSockets)
- [ ] **v2.1**: Templates de diagramas pré-definidos
- [ ] **v2.2**: Integração com Git para versionamento
- [ ] **v2.3**: API REST pública
- [ ] **v2.4**: Mobile app (React Native)
- [ ] **v2.5**: IA para sugestões de arquitetura

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Veja como:

1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add: AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### 📝 Convenções de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## 📄 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Frontend (Vite dev server)
npm run backend:dev      # Backend (Nodemon)
npm run dev:full         # Frontend + Backend simultaneamente

# Produção
npm run build           # Build de produção
npm run preview         # Preview do build

# Qualidade
npm run lint            # ESLint
npm run lint:fix        # ESLint com correções automáticas

# Banco de dados
npm run setup-db        # Inicializar banco de dados
npm run backend         # Servidor de produção
```

## 🔧 Configuração de Desenvolvimento

### Frontend (Vite)
- **Hot Module Replacement** ativado
- **Proxy** para API configurado
- **Source maps** habilitados
- **ESLint** integrado

### Backend (Express)
- **Auto-reload** com Nodemon
- **CORS** configurado para desenvolvimento
- **Logs** detalhados
- **Rate limiting** configurado

## 📊 Database Schema

```sql
-- Tabelas principais
Users (id, email, name, password, role, created_at)
Projects (id, name, description, owner_id, created_at)
Diagrams (id, project_id, name, data, version, created_at)
ProjectPermissions (id, user_id, project_id, role, granted_at)
AuditLog (id, user_id, action, entity_type, entity_id, timestamp)
```

## 🛡️ Segurança

- **Senhas** hashadas com bcryptjs
- **JWT** para autenticação
- **CORS** configurado adequadamente
- **Rate limiting** para APIs
- **Validação** de inputs
- **SQL Injection** protegido com prepared statements

## 📚 Documentação

- [**Guia de Instalação**](./docs/CONTEXT.md)
- [**API Reference**](./docs/PROJECT_CONTEXT.md)
- [**Guia de Contribuição**](./docs/TEMPLATES.md)
- [**Troubleshooting**](./docs/ERROR_HANDLING_GUIDE.md)

## 👨‍💻 Autor

**Andrew** - *Desenvolvimento Fullstack*
- GitHub: [@Andrew-HiTe](https://github.com/Andrew-HiTe)
- Projeto: [StartTech](https://github.com/Andrew-HiTe/StartTech)

## 📄 Licença

Este projeto foi desenvolvido como projeto final da **Imersão Start-Tech edição Cloud**.

---

<div align="center">

**⭐ Não esqueça de dar uma estrela se este projeto te ajudou!**

</div>
