# 📂 CONTEXT GUIDE - StartTech C4 Diagram App

## 🔥 ARQUIVOS PRINCIPAIS (TOP 5)
1. **`src/App.tsx`** - Componente principal com ReactFlow
2. **`src/stores/diagramStore.ts`** - Zustand store (266 linhas)
3. **`src/components/C4Node.tsx`** - Componente de nó customizado
4. **`package.json`** - Dependências do projeto
5. **`tailwind.config.cjs`** - Configuração do Tailwind

## ⚡ COMANDOS ESSENCIAIS
```bash
# Desenvolvimento
npm run dev          # Inicia servidor Vite (porta 5173)
npm run build        # Build TypeScript + Vite
npm run lint         # ESLint check
npm run preview      # Preview do build

# Debug rápido
npm list @xyflow/react   # Verificar versão React Flow
npm outdated            # Verificar deps desatualizadas
```

## 🔧 DEPENDÊNCIAS CRÍTICAS
- **@xyflow/react**: 12.8.4 (ReactFlow principal)
- **zustand**: 5.0.8 (State management)
- **react**: 19.1.1 (Core React)
- **tailwindcss**: 3.4.17 (Styling)
- **typescript**: Latest (Type checking)

## 🏗️ ESTRUTURA DO PROJETO
```
src/
├── App.tsx              # Main app with ReactFlow
├── stores/
│   ├── diagramStore.ts  # Zustand state management
│   └── useDiagramIntegration.ts
├── components/
│   ├── C4Node.tsx       # Custom node component
│   ├── Toolbar.tsx      # Diagram toolbar
│   ├── Header.tsx       # App header
│   └── Sidebar*.tsx     # Sidebar variants
└── assets/              # Static assets
```

## 🎯 PATTERNS EM USO
- **React Flow**: Custom nodes + edges
- **Zustand**: Centralized state with actions
- **TypeScript**: Strict typing for nodes/edges
- **Tailwind**: Utility-first CSS
- **Vite**: Fast dev server + build
