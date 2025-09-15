# T-Draw - Sistema de Diagramas Inteligentes

## 📋 Sobre o Projeto

O T-Draw é um sistema completo para criação e gerenciamento de diagramas técnicos, integrando uma página de landing page, sistema de login e um editor de diagramas avançado. O projeto foi migrado de React JavaScript para React TypeScript + Vite + Tailwind CSS.

## 🚀 Funcionalidades

### 🏠 Página Home
- Landing page com apresentação do produto
- Design responsivo com gradientes e animações
- Lista de funcionalidades principais
- Botão de call-to-action para login

### 🔐 Sistema de Login
- Interface de autenticação limpa e moderna
- Validação de email e senha
- Feedback visual para erros
- Botão de voltar para home

### 📊 Editor de Diagramas
- Editor completo de diagramas C4
- Criação de nós e conexões
- Sidebar com ferramentas
- Exportação de diagramas
- Sistema de stores com Zustand

## 🛠️ Tecnologias Utilizadas

- **React 19** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **React Router DOM** - Roteamento
- **@xyflow/react** - Editor de diagramas
- **Zustand** - Gerenciamento de estado

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx          # Formulário de login
│   ├── home/
│   │   └── Home.tsx               # Página inicial
│   ├── shared/
│   │   ├── Button.tsx             # Componente de botão reutilizável
│   │   ├── Header.tsx             # Cabeçalho das páginas
│   │   ├── TextMain.tsx           # Seção de texto principal
│   │   └── FeaturesList.tsx       # Lista de funcionalidades
│   ├── DiagramPage.tsx            # Página do editor de diagramas
│   └── [outros componentes do diagrama...]
├── stores/
│   ├── diagramStore.ts            # Store principal do diagrama
│   ├── diagramManager.ts          # Gerenciamento de diagramas
│   └── useDiagramIntegration.ts   # Integração entre stores
├── assets/
│   └── images/                    # Imagens do projeto
├── App.tsx                        # Componente principal com roteamento
└── main.tsx                       # Ponto de entrada
```

## 🚦 Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em modo desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar no navegador:**
   ```
   http://localhost:5173
   ```

## 🗺️ Fluxo de Navegação

1. **Home (`/`)** - Página inicial com apresentação
2. **Login (`/login`)** - Tela de autenticação
3. **Diagrama (`/diagram`)** - Editor de diagramas

### Navegação:
- Na **Home**: Botão "Entrar" ou "Comece já" → Login
- No **Login**: Após autenticação → Diagrama
- No **Login**: Botão "Voltar" → Home

## 🎨 Componentes Migrados

### Da versão JavaScript para TypeScript:

1. **Header** - Cabeçalho com logo e botão de login
2. **Button** - Botão reutilizável com gradientes
3. **TextMain** - Seção principal com título e descrição
4. **FeaturesList** - Grid de funcionalidades
5. **Home** - Página inicial completa
6. **LoginForm** - Formulário de autenticação

### Melhorias aplicadas:
- ✅ Tipagem TypeScript completa
- ✅ Tailwind CSS para estilização
- ✅ Componentes funcionais com hooks
- ✅ Props tipadas com interfaces
- ✅ Roteamento com React Router
- ✅ Integração com o sistema de diagramas existente

## 🔧 Configurações

### Tailwind CSS
O projeto usa Tailwind CSS com configurações personalizadas:
- Animação `slideIn` para notificações
- Gradientes personalizados
- Classes utilitárias customizadas

### Vite
Configurado para:
- Hot reload
- Build otimizado
- Suporte completo ao TypeScript
- Plugins do React

## 📝 Próximos Passos

Para finalizar a integração, considere:

1. **Backend**: Implementar API real para autenticação
2. **Persistência**: Salvar diagramas no banco de dados
3. **Autenticação**: JWT tokens e proteção de rotas
4. **Responsividade**: Ajustes para mobile
5. **Testes**: Implementar testes unitários

## 🤝 Contribuição

O projeto está configurado e pronto para desenvolvimento. Para contribuir:

1. Clone o repositório
2. Instale as dependências
3. Execute `npm run dev`
4. Faça suas alterações
5. Teste localmente
6. Submeta um Pull Request

---

**Status**: ✅ Migração completa e funcional
**Versão**: 2.0.0 (TypeScript + Vite)
**Última atualização**: Setembro 2025
