# 🎯 PROMPT PARA CONTINUIDADE DO PROJETO C4 DIAGRAM

## 📋 CONTEXTO DO PROJETO

Estou desenvolvendo um **sistema de diagramas C4 para uso corporativo** com funcionalidade híbrida de mouse. O projeto começou em HTML/CSS/JavaScript vanilla, mas precisa ser **migrado para React** para resolver problemas de responsividade e manutenibilidade.

## 🎯 OBJETIVOS PRINCIPAIS

### Funcionalidade Híbrida Essencial:
- **Arrastar tabela** = Move a tabela
- **Arrastar setas (↑→↓←)** = Cria conexões
- **SEM necessidade de trocar ferramentas/modos**

### Requisitos de UX:
- Setas **perpendiculares às arestas** das tabelas
- **Escolha precisa** do lado da aresta para conexão
- **Áreas de conexão expandidas** (60px ao redor) para facilitar o snap
- **Feedback visual** em tempo real durante conexões
- **Sistema magnético** que detecta automaticamente a melhor aresta

## 🔧 ESTADO ATUAL DO PROJETO

### Estrutura de Arquivos:
```
C:\Users\CTT\Desktop\Reactflow\
├── server-melhorado.js (Node.js HTTP server)
├── diagrama-mouse-hibrido.html (versão atual com problemas)
├── diagrama-figma-style.html (versão anterior funcional)
└── outras versões anteriores
```

### Problemas Identificados:
1. **Setas não aparecem** corretamente
2. **Sistema de conexão quebrado** após últimas modificações
3. **Função checkSnapTarget** implementada incorretamente
4. **Detecção de áreas de conexão** não funcionando
5. **Estado do JavaScript** se tornou complexo demais para manter

## 🚀 MIGRAÇÃO PARA REACT - ESPECIFICAÇÕES

### Stack Tecnológica Desejada:
- **React 18** com TypeScript
- **React Flow** (biblioteca especializada para diagramas)
- **Zustand** para gerenciamento de estado
- **Tailwind CSS** para estilização
- **Vite** para build rápido

### Funcionalidades a Implementar:

#### 1. Sistema Híbrido de Mouse:
```typescript
// Lógica desejada:
- onNodeDrag: move tabela
- onArrowDrag: cria conexão
- Sem alternância de modos
```

#### 2. Setas de Conexão:
```typescript
interface ArrowProps {
  position: 'top' | 'right' | 'bottom' | 'left'
  direction: '↑' | '→' | '↓' | '←' // perpendicular à aresta
  onDragStart: (sourceNode, position) => void
}
```

#### 3. Sistema de Snap:
```typescript
interface SnapArea {
  nodeId: string
  position: 'top' | 'right' | 'bottom' | 'left'
  offset: number // 0.1 to 0.9 (posição na aresta)
  detectionRadius: 60 // pixels
}
```

#### 4. Estrutura de Dados:
```typescript
interface Node {
  id: string
  x: number
  y: number
  width: number
  title: string
  description: string
}

interface Connection {
  id: string
  source: string
  target: string
  sourcePosition: 'top' | 'right' | 'bottom' | 'left'
  targetPosition: 'top' | 'right' | 'bottom' | 'left'
  sourceOffset: number
  targetOffset: number
}
```

## 🎨 ESPECIFICAÇÕES VISUAIS

### Tabelas/Nós:
- Fundo branco, bordas arredondadas (12px)
- Header com gradiente sutil
- Tamanho: 180px largura mínima
- Hover: borda azul + shadow
- Selecionado: borda azul + outline

### Setas de Conexão:
- Tamanho: 20x20px
- Cores: azul → laranja (drag) → verde (can connect)
- Posição: perpendicular às arestas
- Opacity: 0 → 0.9 (hover) → 1 (dragging)

### Conexões:
- Linhas curvas (Bezier) suaves
- Strokewidth: 3px
- Cor: cinza → azul (hover) → laranja (selected)
- Setas nas pontas

### Áreas de Snap:
- Raio de detecção: 60px
- Feedback: borda verde + pontos de conexão visíveis
- Snap automático na aresta mais próxima

## 🔨 AÇÕES NECESSÁRIAS

### 1. Setup do Projeto React:
```bash
npm create vite@latest c4-diagram-react -- --template react-ts
cd c4-diagram-react
npm install @xyflow/react zustand tailwindcss
```

### 2. Componentes Principais:
- `DiagramCanvas` (container principal)
- `TableNode` (nó customizado com setas)
- `ConnectionArrow` (setas de conexão)
- `SnapZone` (áreas de detecção)
- `Toolbar` (controles superiores)

### 3. Funcionalidades Críticas:
- Sistema de drag híbrido
- Detecção de proximidade para snap
- Renderização de conexões curvas
- Feedback visual em tempo real

## 🐛 PROBLEMAS A RESOLVER

### Versão HTML Atual:
1. `checkSnapTarget` não está funcionando
2. Setas não aparecem (CSS/posicionamento)
3. Event listeners conflitantes
4. Estado global bagunçado

### Migração para React:
1. Implementar drag system sem conflitos
2. Gerenciar estado de forma previsível
3. Otimizar performance das conexões
4. Criar sistema de snap robusto

## 📝 EXEMPLO DE USO FINAL

```
1. Usuário vê tabelas na tela
2. Hover na tabela → setas aparecem nas 4 bordas
3. Drag da seta → linha temporária segue mouse
4. Aproxima de outra tabela → área fica verde + snap automático
5. Release → conexão criada na posição exata
6. Drag da tabela → move sem afetar conexões
```

## 🎯 PROMPT PARA O ASSISTANT

**"Preciso migrar um sistema de diagramas C4 de HTML/JavaScript para React. O projeto tem funcionalidade híbrida onde arrastar tabelas move elas e arrastar setas cria conexões, sem trocar ferramentas. A versão atual em HTML está com bugs nas conexões e setas não aparecem. Quero uma versão React com React Flow, TypeScript, Zustand e Tailwind. As setas devem ser perpendiculares às arestas, com áreas de snap de 60px e feedback visual em tempo real. Pode criar a estrutura completa do projeto React com todas as funcionalidades?"**

## 📁 ARQUIVOS DE REFERÊNCIA

Se necessário, os arquivos HTML atuais estão em:
- `diagrama-mouse-hibrido.html` (versão com problemas)
- `diagrama-figma-style.html` (versão estável anterior)
- `server-melhorado.js` (servidor Node.js atual)

---

**Data:** 2 de setembro de 2025
**Projeto:** Sistema C4 Diagram Corporativo
**Status:** Migração para React necessária
