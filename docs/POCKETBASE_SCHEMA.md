# 🗄️ PocketBase Schema - DailyTrim

## 🏗️ Problema: Hierarquia em Collections Planas

PocketBase usa **collections planas**, mas precisamos de hierarquia organizacional:

```
Organization (topo)
  ├─ Users (members da org)
  └─ Workspaces
      └─ Projects
          └─ Tasks
              └─ Documents
```

## ✅ Solução: Foreign Keys + Row Level Security (RLS)

### Estratégia:
1. **Toda collection tem `organization_id`** (relation para `organizations`)
2. **RLS rules** garantem isolamento entre orgs
3. **Cascade deletes** onde faz sentido
4. **Indexes** em foreign keys para performance

---

## 📊 Collections Schema

### 1. `organizations` (NOVA - v0.3)
**Descrição**: Entidade raiz. Tudo pertence a uma org.

```javascript
{
  id: "org_xxx",
  name: "Acme Corp",
  slug: "acme", // único, para URLs
  owner: "user_xxx", // relation -> users (quem criou)
  settings: {}, // JSON: logo, cores, preferências
  plan: "free", // free, pro, enterprise
  created: "2025-01-08...",
  updated: "2025-01-08..."
}
```

**Rules (RLS):**
- `listRule`: `@request.auth.id != '' && (owner = @request.auth.id || members.user ?= @request.auth.id)`
- `viewRule`: `@request.auth.id != '' && (owner = @request.auth.id || members.user ?= @request.auth.id)`
- `createRule`: `@request.auth.id != '' && owner = @request.auth.id`
- `updateRule`: `owner = @request.auth.id || members.role ?= "admin"`
- `deleteRule`: `owner = @request.auth.id`

**Indexes:**
- `slug` (unique)
- `owner`

---

### 2. `organization_members` (NOVA - v0.3)
**Descrição**: Relacionamento N:N entre users e organizations.

```javascript
{
  id: "mem_xxx",
  organization: "org_xxx", // relation -> organizations
  user: "user_xxx", // relation -> users
  role: "editor", // admin, editor (apenas 2 roles)
  invited_by: "user_yyy", // relation -> users (sempre owner ou admin)
  created: "2025-01-08...",
  updated: "2025-01-08..."
}
```

**Roles Explicadas:**
- **Owner** (1 por org):
  - Está no campo `owner` da `organizations` (não em `organization_members`)
  - Pode tudo: CRUD em tudo, gerenciar membros, deletar org
  - Não pode sair da org (só deletando ela)
  - Único que pode promover admins

- **Admin** (múltiplos permitidos):
  - Pode criar/editar/deletar workspaces, projects
  - Pode convidar/remover editors
  - Pode editar settings da org
  - **NÃO pode**: remover outros admins, mudar owner, deletar org

- **Editor** (usuários comuns):
  - Pode criar/editar tasks e documents
  - Pode visualizar tudo da org
  - **NÃO pode**: gerenciar membros, deletar projects/workspaces

**Rules (RLS):**
- `listRule`: `organization.owner = @request.auth.id || organization.members.user ?= @request.auth.id`
- `viewRule`: `organization.owner = @request.auth.id || user = @request.auth.id`
- `createRule`: `organization.owner = @request.auth.id || organization.members.role ?= "admin"` (só owner/admin convidam)
- `updateRule`: `organization.owner = @request.auth.id` (só owner muda roles)
- `deleteRule`: `organization.owner = @request.auth.id || user = @request.auth.id` (owner remove, ou user sai)

**Indexes:**
- `organization` + `user` (unique composite)
- `user`
- `organization` + `role`

---

### 3. `users` (JÁ EXISTE - Sistema PocketBase)
**Descrição**: Usuários do sistema. Collection especial `_pb_users_auth_`.

```javascript
{
  id: "user_xxx",
  email: "user@example.com",
  username: "usuario",
  name: "Nome Completo",
  avatar: "url...", // opcional
  emailVisibility: false,
  verified: true,
  // ... outros campos do PocketBase
}
```

**⚠️ IMPORTANTE - Registro Fechado (v0.3+):**

**Desktop Standalone (v1.0):**
- Registro aberto: primeiro user vira owner da org "Personal"
- Self-service completo

**Server Mode (v2.0):**
- **Registro público DESABILITADO**
- Apenas owner pode criar novos usuários
- Workflow:
  1. Owner acessa Settings → Members → "Add Member"
  2. Owner cria user com email, username, senha temporária
  3. Owner define role (admin ou editor)
  4. Owner **passa credenciais manualmente** para o membro (email, chat, etc.)
  5. Membro faz primeiro login e troca senha

**Configuração PocketBase (Server Mode):**
```javascript
// Desabilitar registro público via Admin UI ou migration:
app.settings().meta.hideRegistrationLink = true;
app.settings().meta.allowPublicAuth = false;
```

**Frontend:**
- Remover link/botão "Criar conta" da tela de login
- Apenas mostrar "Login" para server mode
- Owner tem painel de gerenciamento de usuários

**Nota**: Usuários podem pertencer a **múltiplas orgs** via `organization_members`.

---

### 4. `workspaces` (NOVA - v0.3)
**Descrição**: Agrupamento de projetos dentro de uma org.

```javascript
{
  id: "ws_xxx",
  organization: "org_xxx", // relation -> organizations (CASCADE DELETE)
  name: "Marketing",
  description: "Workspace de marketing",
  color: "#FF6B6B", // para UI
  icon: "📊", // emoji ou ícone
  archived: false,
  created: "2025-01-08...",
  updated: "2025-01-08..."
}
```

**Rules (RLS):**
- `listRule`: `organization.owner = @request.auth.id || organization.members.user ?= @request.auth.id`
- `viewRule`: `organization.owner = @request.auth.id || organization.members.user ?= @request.auth.id`
- `createRule`: `organization.owner = @request.auth.id || organization.members.role ?= "admin"`
- `updateRule`: `organization.owner = @request.auth.id || organization.members.role ?= "admin"`
- `deleteRule`: `organization.owner = @request.auth.id`

**Indexes:**
- `organization`
- `organization` + `archived`

---

### 5. `projects` (NOVA - v0.3)
**Descrição**: Projetos dentro de workspaces.

```javascript
{
  id: "proj_xxx",
  organization: "org_xxx", // relation -> organizations (CASCADE DELETE)
  workspace: "ws_xxx", // relation -> workspaces (CASCADE DELETE)
  name: "Campanha Q1 2025",
  description: "Campanha de lançamento do Q1",
  status: "active", // active, on_hold, completed, archived
  start_date: "2025-01-01",
  due_date: "2025-03-31",
  owner: "user_xxx", // relation -> users (responsável)
  color: "#4ECDC4",
  archived: false,
  created: "2025-01-08...",
  updated: "2025-01-08..."
}
```

**Rules (RLS):**
- `listRule`: `organization.owner = @request.auth.id || organization.members.user ?= @request.auth.id`
- `viewRule`: `organization.owner = @request.auth.id || organization.members.user ?= @request.auth.id`
- `createRule`: `organization.members.user ?= @request.auth.id && organization.members.role != "viewer"`
- `updateRule`: `organization.members.user ?= @request.auth.id && organization.members.role != "viewer"`
- `deleteRule`: `organization.owner = @request.auth.id || owner = @request.auth.id`

**Indexes:**
- `organization`
- `workspace`
- `organization` + `archived`

---

### 6. `tasks` (REFATORAR EXISTENTE - v0.3)
**Descrição**: Tasks vinculadas a projetos. Refatorar para incluir org hierarchy.

**ANTES (v0.1):**
```javascript
{
  id: "task_xxx",
  title: "Criar assets",
  status: "todo",
  priority: "high",
  due_at: "2025-01-15",
  timeSpent: 3600,
  notes: "...",
  owner: "user_xxx" // relation -> users
}
```

**DEPOIS (v0.3):**
```javascript
{
  id: "task_xxx",
  organization: "org_xxx", // relation -> organizations (CASCADE DELETE) **NOVO**
  workspace: "ws_xxx", // relation -> workspaces (CASCADE DELETE, nullable) **NOVO**
  project: "proj_xxx", // relation -> projects (CASCADE DELETE, nullable) **NOVO**
  title: "Criar assets",
  description: "Descrição detalhada", // **NOVO** (antes era notes)
  status: "todo",
  priority: "high",
  start_date: null, // **NOVO**
  due_date: "2025-01-15", // (antes era due_at)
  estimated_hours: 4, // **NOVO**
  actual_hours: 0, // **NOVO** (antes era timeSpent em segundos)
  assignee: "user_xxx", // relation -> users (responsável) **NOVO**
  created_by: "user_yyy", // relation -> users (quem criou) **NOVO**
  parent_task: null, // relation -> tasks (para subtasks) **NOVO**
  tags: ["design", "urgent"], // array de strings **NOVO**
  archived: false, // **NOVO**
  created: "2025-01-08...",
  updated: "2025-01-08..."
}
```

**Migration Strategy:**
1. Adicionar campos novos (nullable inicialmente)
2. Script de migração: criar org padrão "Personal" para cada user existente
3. Popular `organization` de todas tasks existentes com org "Personal" do owner
4. Tornar `organization` obrigatório após migração

**Rules (RLS):**
```javascript
listRule: `organization.owner = @request.auth.id ||
           organization.members.user ?= @request.auth.id`,

viewRule: `organization.owner = @request.auth.id ||
           organization.members.user ?= @request.auth.id`,

createRule: `organization.members.user ?= @request.auth.id &&
             organization.members.role != "viewer" &&
             created_by = @request.auth.id`,

updateRule: `organization.members.user ?= @request.auth.id &&
             (assignee = @request.auth.id || created_by = @request.auth.id ||
              organization.members.role ?= "admin")`,

deleteRule: `organization.owner = @request.auth.id ||
             created_by = @request.auth.id`
```

**Indexes:**
- `organization`
- `project`
- `assignee`
- `organization` + `status`
- `organization` + `archived`

---

### 7. `documents` (NOVA - v0.3)
**Descrição**: Documentos (wiki) vinculados a projetos, tasks ou standalone.

```javascript
{
  id: "doc_xxx",
  organization: "org_xxx", // relation -> organizations (CASCADE DELETE)
  workspace: "ws_xxx", // relation -> workspaces (CASCADE DELETE, nullable)
  project: "proj_xxx", // relation -> projects (CASCADE DELETE, nullable)
  task: "task_xxx", // relation -> tasks (CASCADE DELETE, nullable)
  title: "Briefing da Campanha",
  content: {...}, // JSON do Lexical Editor
  content_text: "texto plano", // para indexação no MeiliSearch
  type: "wiki", // wiki, note, spec, meeting_notes
  version: 1,
  created_by: "user_xxx", // relation -> users
  last_edited_by: "user_yyy", // relation -> users
  archived: false,
  created: "2025-01-08...",
  updated: "2025-01-08..."
}
```

**Rules (RLS):**
- Similar às tasks (acesso via organization membership)

**Indexes:**
- `organization`
- `project`
- `task`
- `organization` + `type`
- `organization` + `archived`

---

### 8. `navidrome_config` (JÁ EXISTE - v0.2)
**Descrição**: Configuração do Navidrome (não muda em v0.3).

```javascript
{
  id: "nav_xxx",
  user: "user_xxx", // relation -> users
  server_url: "https://music.example.com",
  username: "usuario",
  password: "encrypted", // criptografado
  created: "2025-01-08...",
  updated: "2025-01-08..."
}
```

**Nota**: Por enquanto, config Navidrome é **por usuário**, não por org.
Futuro (v2.0): Pode ser por workspace se quiser music compartilhada.

---

## 🔄 Migration Strategy (v0.1 → v0.3)

### Ordem das Migrations:

```javascript
// 1. Create organizations
pb_migrations/1759600000_create_organizations.js

// 2. Create organization_members
pb_migrations/1759600001_create_organization_members.js

// 3. Create default "Personal" org for existing users
pb_migrations/1759600002_populate_default_organizations.js

// 4. Create workspaces
pb_migrations/1759600003_create_workspaces.js

// 5. Create projects
pb_migrations/1759600004_create_projects.js

// 6. Alter tasks (add org fields)
pb_migrations/1759600005_alter_tasks_add_organization.js

// 7. Populate tasks with org (from owner)
pb_migrations/1759600006_populate_tasks_organization.js

// 8. Make organization required in tasks
pb_migrations/1759600007_alter_tasks_organization_required.js

// 9. Create documents
pb_migrations/1759600008_create_documents.js
```

---

## 🎯 Exemplo de Queries com RLS

### Listar todos os projetos que o user tem acesso:

```javascript
const projects = await pb.collection('projects').getFullList({
  filter: '', // RLS já filtra automaticamente!
  expand: 'workspace,organization,owner',
  sort: '-created'
});
```

**PocketBase automaticamente aplica a `listRule`:**
```
organization.owner = @request.auth.id ||
organization.members.user ?= @request.auth.id
```

### Criar task vinculada a projeto:

```javascript
const task = await pb.collection('tasks').create({
  organization: project.organization, // herda do projeto
  workspace: project.workspace,
  project: project.id,
  title: "Nova task",
  status: "todo",
  assignee: currentUser.id,
  created_by: currentUser.id
});
```

**PocketBase valida via `createRule`.**

---

## 🔐 Isolamento de Dados (Multi-tenancy)

### Como funciona:
1. **Usuário faz login** → PocketBase cria token JWT com `@request.auth.id`
2. **Toda query** automaticamente filtra por:
   - `organization.owner = @request.auth.id` (é dono da org)
   - OU `organization.members.user ?= @request.auth.id` (é membro)
3. **Impossível** acessar dados de outra org (garantido pelo RLS)

### Exemplo de isolamento:

```javascript
// User A (member da Org1) tenta acessar task da Org2
const task = await pb.collection('tasks').getOne('task_from_org2');
// ❌ ERRO 404: Not found (RLS bloqueou)

// User A lista suas tasks
const tasks = await pb.collection('tasks').getFullList();
// ✅ Retorna APENAS tasks da Org1
```

---

## 💡 Vantagens dessa Modelagem

1. ✅ **Isolamento garantido** por RLS (não depende de lógica frontend)
2. ✅ **Performance**: Indexes em `organization` tornam queries rápidas
3. ✅ **Flexível**: User pode ter múltiplas orgs
4. ✅ **Migração gradual**: Não quebra código v0.1 durante transição
5. ✅ **Cascade deletes**: Apagar org limpa tudo automaticamente
6. ✅ **Escalável**: Funciona tanto em SQLite local quanto Postgres server

---

## 🚧 Próximos Passos (v0.3)

1. Criar migrations na ordem correta
2. Testar localmente em SQLite
3. Script de migração de dados existentes
4. Atualizar frontend para usar nova hierarquia
5. Testes de RLS (tentar burlar isolamento)

---

**Última atualização**: 2025-01-08
**Versão**: 1.0 (v0.3 schema)
