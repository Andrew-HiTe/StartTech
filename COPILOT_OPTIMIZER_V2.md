# 🚀 COPILOT OPTIMIZER V2 - SISTEMA INTELIGENTE

## 📋 PROMPT UNIVERSAL (Copie este texto):

**Análise este projeto e implemente um sistema de otimização de desenvolvimento em /docs com estes 4 arquivos:**

1. **`ERROR_GUIDE.md`** - Erros comuns desta stack + soluções testadas + debugging rápido
2. **`CONTEXT.md`** - Stack atual + arquivos críticos + comandos essenciais + estado funcional  
3. **`QUICK_CHECKS.md`** - Validações build + checklist qualidade + fixes instantâneos
4. **`TEMPLATES.md`** - Padrões de código + estruturas reutilizáveis + convenções

**Objetivo:** Context caching inteligente para acelerar desenvolvimento 3x. Preencha automaticamente com dados específicos deste projeto.

---

## 🎯 TEMPLATES MÍNIMOS (Referência para o Copilot)

### ERROR_GUIDE.md
```markdown
# [PROJETO] - Error Guide

## Stack: [AUTO_DETECT]
## Build: `[MAIN_BUILD_CMD]`
## Test: `[MAIN_TEST_CMD]`

## Top 3 Errors:
1. **[ERROR_1]**: `[FIX_CMD_1]`
2. **[ERROR_2]**: `[FIX_CMD_2]`  
3. **[ERROR_3]**: `[FIX_CMD_3]`

## Emergency Reset:
```bash
[CLEAN_COMMANDS]
```
```

### CONTEXT.md  
```markdown
# [PROJETO] Context

## Stack: [LANGUAGE] + [FRAMEWORK] + [BUILD_TOOL]
## Key Files: [TOP_5_FILES]
## Dev: `[DEV_CMD]` | Build: `[BUILD_CMD]` | Test: `[TEST_CMD]`

## Working Features:
[AUTO_LIST_CURRENT_FEATURES]

## Critical Dependencies:
[TOP_5_DEPS_WITH_VERSIONS]
```

### QUICK_CHECKS.md
```markdown
# Quick Checks

## Pre-commit:
- [ ] `[BUILD_CMD]` (no errors)
- [ ] `[TEST_CMD]` (all pass)
- [ ] `[LINT_CMD]` (clean)

## Quick Fixes:
- Build fail: `[RESET_CMD]`
- Deps issue: `[DEPS_CMD]`
- Cache problem: `[CLEAN_CMD]`
```

### TEMPLATES.md
```markdown
# Templates

## [MAIN_COMPONENT_TYPE]:
```[LANGUAGE]
[MINIMAL_WORKING_TEMPLATE]
```

## [MAIN_PATTERN]:
```[LANGUAGE]  
[ESSENTIAL_PATTERN]
```
```

---

## 🧠 ESTRATÉGIAS DE OTIMIZAÇÃO

### Para o Copilot:
1. **Detecte automaticamente** stack via arquivos (package.json, etc.)
2. **Use padrões existentes** como base para templates
3. **Teste comandos** antes de documentar
4. **Mantenha conciso** - max 50 linhas por arquivo
5. **Foque no essencial** - apenas o que acelera desenvolvimento

### Para o Desenvolvedor:
1. **Use prompts específicos**: "Consulte ERROR_GUIDE e resolva este erro: [erro]"
2. **Context rápido**: "Consulte CONTEXT.md para implementar [feature]"
3. **Validação**: "Execute QUICK_CHECKS antes do commit"
4. **Templates**: "Use TEMPLATES.md para criar [componente]"

---

## ⚡ EVOLUTION PROMPTS

### Atualização Contínua:
```
Analise nossa sessão e atualize ERROR_GUIDE.md com novos erros descobertos e TEMPLATES.md com novos padrões utilizados.
```

### Otimização Específica:
```
Optimize CONTEXT.md baseado no desenvolvimento atual. Adicione comandos que usei frequentemente.
```

---

**🎯 RESULTADO: 4 arquivos compactos, específicos e evolutivos que aceleram desenvolvimento real.**
