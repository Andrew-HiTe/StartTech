# T-Draw Project Context Cache

## 🏗️ Stack Tecnológico Atual
- **Frontend:** React 18 + TypeScript + Vite 7.1.4
- **Diagramas:** React Flow 12.8.4
- **Estado:** Zustand 5.0.8
- **Estilo:** Tailwind CSS 3.4.17
- **Tema:** Cores TOTVS (#0457A7), Fonte Nunito Sans

## 📁 Arquitetura de Arquivos Críticos

### Core Components
```
/src/App.tsx                 - Layout principal + ReactFlow setup
/src/components/
  ├── SidebarSimple.tsx      - Interface T-Draw sidebar
  ├── Header.tsx             - Header com título projeto
  ├── Modal.tsx              - Modal component reutilizável
  ├── C4Node.tsx             - Componente de nó do diagrama
  └── Toolbar.tsx            - Ferramentas do diagrama
```

### State Management
```
/src/stores/
  ├── diagramStore.ts        - Estado ReactFlow (nodes/edges)
  ├── diagramManager.ts      - Gerenciamento multi-diagramas
  └── useDiagramIntegration.ts - Hook de integração stores
```

## ⚡ Estado Funcional Atual

### ✅ Implementado e Funcionando
- [x] Interface T-Draw com cores corretas (#0457A7)
- [x] Sidebar com busca, lista diagramas, modais
- [x] Modal "Criar Diagrama" funcional
- [x] Modal "Gerenciar Acessos" funcional
- [x] Integração Zustand completa entre stores
- [x] Auto-save com debounce (1s)
- [x] Indicador visual diagrama ativo
- [x] Build limpo sem erros TypeScript

### 🎯 Funcionalidades Core
1. **Criar diagramas:** Nome + tipo (C4/UML/Flowchart)
2. **Selecionar diagrama:** Carrega dados específicos na área
3. **Buscar diagramas:** Filtro em tempo real
4. **Gerenciar usuários:** Adicionar/remover acessos
5. **Sincronização:** Mudanças salvas automaticamente

## 🔧 Configuração TypeScript Crítica
```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true  // ⚠️ Requer imports explícitos
  }
}
```

## 🎨 Design System Patterns
```css
/* Cores principais */
bg-[#0457A7]      /* Azul TOTVS sidebar */
bg-blue-600       /* Botões interativos */
text-white        /* Texto sobre azul */
font-['Nunito_Sans'] /* Fonte padrão */

/* Layout responsivo */
w-64 / w-16       /* Sidebar expandida/minimizada */
transition-all duration-300 /* Animações suaves */
```

## 🚀 Commands Frequentes
```bash
npm run dev       # Desenvolvimento
npm run build     # Build produção  
npm run preview   # Preview build
```

## 📦 Dependencies Chave
```json
{
  "@xyflow/react": "12.8.4",
  "zustand": "5.0.8", 
  "react": "^18.3.1",
  "typescript": "~5.6.2"
}
```

---
**Última sync:** 02/09/2025 - Interface T-Draw completa e funcional
