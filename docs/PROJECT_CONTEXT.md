# StartTech C4 Diagram App - Context Cache

## 🏗️ Stack Tecnológico Atual
- **Linguagem Principal:** TypeScript
- **Framework:** React v19.1.1
- **Build Tool:** Vite v7.1.2
- **Package Manager:** npm v10.x
- **Outras Tools:** React Flow v12.8.4, Zustand v5.0.8, Tailwind CSS v3.4.17, ESLint v9.33.0

## 📁 Arquitetura de Arquivos Críticos

### Estrutura Principal
```
src/
├── App.tsx              # Componente principal com ReactFlow
├── main.tsx             # Ponto de entrada React
├── components/
│   ├── C4Node.tsx       # Componente de nó C4 customizado
│   ├── Header.tsx       # Header da aplicação
│   ├── Toolbar.tsx      # Barra de ferramentas
│   ├── Sidebar*.tsx     # Variações da barra lateral
│   └── Modal.tsx        # Componentes modais
├── stores/
│   ├── diagramStore.ts  # Zustand store principal (271 linhas)
│   ├── useDiagramIntegration.ts # Hook de integração
│   └── diagramManager.ts # Gerenciador de diagramas
└── assets/              # Recursos estáticos
```

### Arquivos de Configuração
- `vite.config.ts` - Configuração do build e dev server
- `tsconfig.json` - Configuração TypeScript principal
- `tsconfig.app.json` - Config específica da aplicação
- `tailwind.config.cjs` - Configuração CSS utility-first
- `eslint.config.js` - Rules de qualidade de código

### Pontos de Entrada
- **Main:** `src/main.tsx`
- **Config:** `vite.config.ts`
- **Build:** `package.json` scripts

## ⚡ Estado Funcional Atual

### ✅ Implementado e Funcionando
- Sistema de diagramas C4 interativos
- Componentes de nó personalizáveis (Person, System, Container, Component)
- Drag & drop para movimentação de nós
- Sistema de conexões entre nós
- Barra lateral com ferramentas
- Header dinâmico com nome do projeto/diagrama
- Store Zustand para gerenciamento de estado
- Zoom e pan no canvas
- Toolbar com ferramentas de seleção

### 🎯 Componentes/Módulos Core
- **DiagramFlow**: Componente principal React Flow
- **C4NodeComponent**: Nós customizados C4
- **useDiagramStore**: State management com Zustand
- **Header**: Exibição de informações do projeto
- **Sidebar**: Painel lateral de ferramentas
- **Toolbar**: Ferramentas de diagrama

### 📦 Dependencies Chave
```json
{
  "@xyflow/react": "^12.8.4",    # React Flow para diagramas
  "react": "^19.1.1",            # Core React
  "react-dom": "^19.1.1",        # React DOM
  "zustand": "^5.0.8",           # State management
  "tailwindcss": "^3.4.17",      # CSS framework
  "typescript": "~5.8.3",        # Type checking
  "vite": "^7.1.2"               # Build tool
}
```

## 🔧 Configurações Críticas

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## 🚀 Comandos Frequentes

### Desenvolvimento
```bash
npm run dev              # Servidor de desenvolvimento (porta 5173)
npm run dev -- --port 3000  # Servidor em porta específica
npm run dev -- --open   # Abrir automaticamente no browser
```

### Build e Deploy
```bash
npm run build           # Build TypeScript + Vite produção
npm run preview         # Preview do build de produção
tsc -b                  # Compilação TypeScript apenas
```

### Testes
```bash
# Ainda não configurado - TODO: adicionar vitest/jest
npm test                # Placeholder para testes unitários
```

### Qualidade
```bash
npm run lint            # ESLint verificação
npm run lint -- --fix  # ESLint com auto-fix
npx tsc --noEmit       # Type checking sem emitir arquivos
```

### Manutenção
```bash
rm -rf node_modules/.vite  # Limpar cache Vite
rm -rf dist                # Limpar build anterior
npm outdated              # Verificar dependências desatualizadas
npm audit                 # Auditoria de segurança
npm audit fix             # Fix automático de vulnerabilidades
```

## 🎨 Convenções do Projeto

### Nomenclatura
- **Arquivos:** PascalCase para componentes (.tsx), camelCase para stores (.ts)
- **Componentes:** PascalCase (C4NodeComponent, Header, Sidebar)
- **Variáveis:** camelCase (diagramName, currentTool, isConnecting)
- **Funções:** camelCase (onNodesChange, setCurrentTool, addNode)

### Estrutura de Código
- Components em pasta dedicada com tipos TypeScript
- Stores Zustand separados por domínio
- Hooks customizados para integração entre stores
- Tipagem rigorosa com interfaces TypeScript
- CSS com Tailwind utility classes

---
**Última sync:** 3 de Setembro de 2025 - App C4 funcionando com React Flow + Zustand + Tailwind
