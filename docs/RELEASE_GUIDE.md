# 🚀 Guia de Release – DailyTrim

Este documento descreve o processo oficial para criar e publicar uma **release** do DailyTrim.  
Lembre-se: **release não é commit qualquer, é um marco.**

---

## 📌 Regras Mandalorianas
1. **Somente `main` pode gerar release.**  
2. **Nenhuma release sem changelog atualizado.**  
3. **Breaking Changes devem estar documentados.**  
4. **Release só com propósito claro**: MVP, milestone ou hotfix crítico.  
5. **Versão segue SemVer (MAJOR.MINOR.PATCH)**.  

---

## 🛠️ Passo a passo

### 1. Garantir qualidade
- [ ] Todos os testes passando (`pnpm jest` + `cargo test`).
- [ ] Documentação atualizada (`CHANGELOG.md`, `BREAKING_CHANGES.md`).
- [ ] Código revisado via Pull Request.

### 2. Atualizar versionamento
- Editar `CHANGELOG.md`, criando nova seção:
  ```md
  ## [0.1.0] – 2025-10-05
  ### Added
  - Implementação inicial com CRUD de tarefas
  - Timer básico
  - Setup de testes
