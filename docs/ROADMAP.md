# 🚀 Roadmap – DailyTrim

> **Status**: Em desenvolvimento inicial - Sem releases oficiais ainda
>
> **Visão**: AI-powered project management com automação por voz, busca semântica e colaboração real-time

## 🏗️ Arquitetura

### Data Model
```
Organization
  └─ Workspace(s)
      └─ Project(s)
          └─ Task(s)
              └─ Document(s) (opcional)
          └─ Document(s) (standalone - wiki)
```

### Deployment Modes

**1. Standalone (Desktop Local)**
- PocketBase embedded (SQLite local)
- MeiliSearch embedded
- Zero configuration, 100% offline
- Ideal para: usuário solo, freelancers

**2. Server + Clients (Team/Enterprise)**
- **Server**: Docker/Kubernetes com PocketBase + MeiliSearch + N8N
- **Clients**: Desktop, Mobile, Web (todos conectam ao servidor)
- Sync bidirecional com offline-first
- Self-hosted por organização (cada org = instância isolada)
- Ideal para: equipes, empresas

**Tech Stack:**
- **Search**: MeiliSearch (full-text ultra-rápido)
- **Storage**: PocketBase (SQLite local ou Postgres server)
- **Identity**: PocketBase como IdP (OAuth2/OIDC)
- **Automation**: N8N (webhooks e integrações)
- **Voice**: Whisper.cpp (local, offline-first)

---

## ✅ v0.1 (Concluído)
- ✅ Offline-first (PocketBase local)
- ✅ CRUD de tarefas com prioridades e prazos
- ✅ Timer Pomodoro integrado
- ✅ Autenticação de usuários
- ✅ Interface com Carbon Design System
- ✅ Sidebar navegável (VSCode-like)

## 🚧 v0.2 (Em Desenvolvimento)
- ✅ **Music Player** - Integração com Navidrome
  - ✅ Navegação por artistas → álbuns → músicas
  - ✅ Player com controles completos (play/pause, next/previous, volume, seek)
  - ✅ Busca global de artistas, álbuns e músicas
  - ✅ Queue management (adicionar, limpar, próxima/anterior)
  - ✅ Shuffle e Repeat modes
  - ✅ Display de capa de álbum
  - ✅ Error handling para servidor offline (timeout, fallback, indicador)
  - ✅ Visualização da fila de reprodução (drawer discreto no canto inferior)
  - ✅ Keyboard shortcuts (espaço, setas, Q para fila)
  - 🔄 Playlists personalizadas

- 📝 **Editor de Anotações** - [Lexical Editor](https://lexical.dev)
  - Rich text editor baseado no [Playground do Lexical](https://playground.lexical.dev/)
  - Markdown support
  - Plugins: tabelas, código, imagens, links
  - 🎙️ **Speech-to-Text** (Windows via whisper.cpp)
    - Voice recording com hotkey
    - Transcrição local (offline-first)
    - Suporte para PT-BR
    - Inserção direta no editor

## 📋 v0.3 (Foundation - Data Model)
**CORE: Modelagem hierárquica completa**
- 🏢 **Organizations & Workspaces**
  - CRUD de organizações
  - Múltiplos workspaces por org
  - Permissões e roles (owner, admin, member)
- 📦 **Projects**
  - Projetos dentro de workspaces
  - Metadata: status, deadlines, responsáveis
  - Visualizações: kanban, lista, timeline
- ✅ **Tasks Refatoradas**
  - Tasks vinculadas a projetos
  - Subtasks e dependências
  - Assignees e watchers
- 📚 **Documents System**
  - Documentos standalone (wiki)
  - Documentos vinculados a tasks
  - Versionamento básico
- 🔍 **MeiliSearch Integration**
  - Indexação automática de documentos
  - Busca full-text ultra-rápida
  - Faceted search (filtros por projeto, tags, etc.)
- 🎨 **UX Improvements**
  - Editor Lexical completo
  - Integração música + Pomodoro
  - Keyboard shortcuts globais
  - Temas customizáveis

## 🤖 v0.4 (Automação & AI)
**CORE: Voice-powered automation**
- 🎙️ **Voice Assistant Foundation**
  - Hotkey global para ativação
  - Command parser (NLP básico)
  - Audio buffer e processamento em background
  - Comandos: criar tasks, docs, enviar mensagens, agendar
- 📡 **N8N Webhook Integration**
  - Configuração de webhooks personalizados
  - Templates de automação (WhatsApp, Telegram, Email, Slack)
  - Envio de áudio para webhooks (mensagens de voz)
  - Triggers: task completed, deadline approaching, etc.
- ⚡ **Smart Commands**
  - "Adiciona tarefa no projeto X: [texto]"
  - "Manda mensagem pro [nome]: [texto]"
  - "Agenda [evento] para [data/hora]"
  - "Cria nota em [projeto]: [conteúdo]"
  - "Envia áudio para [contato/grupo]"
- 🧠 **Command History & Learning**
  - Histórico de comandos
  - Sugestões baseadas em uso

## 🎯 v1.0 (MVP Desktop Completo)
**Decisão: Desktop-first, cloud depois**
- 🪟 **Build Windows Polido**
  - Auto-update funcional
  - Instalador profissional (NSIS/WiX)
  - System tray integration
- 📊 **Analytics & Dashboards**
  - Estatísticas de produtividade
  - Time tracking automático
  - Reports exportáveis
- 💾 **Backup & Sync**
  - Backup local automático
  - Exportação completa (JSON/SQLite)
  - Importação de outros tools (Notion, Trello, etc.)
- 📖 **Documentação Completa**
  - User guide
  - API docs (para N8N)
  - Video tutorials
- 🐧 **Linux/macOS** (community builds)
  - Binários disponíveis
  - Whisper.cpp via cloud fallback

## 🚀 v1.5 (Premium Features)
- 💎 **Stripe Integration**
  - Assinaturas mensais/anuais
  - Planos: Free, Pro, Team
- 🎙️ **Cross-platform Speech-to-Text**
  - Whisper.cpp para macOS/Linux
  - Modelos otimizados por plataforma
- 🤖 **AI Assistant Avançado**
  - Task suggestions baseadas em contexto
  - Auto-tagging de documentos
  - Smart reminders (ML-based)
- 🎵 **Music Extras**
  - Last.fm scrobbling
  - Spotify integration (além de Navidrome)
- 🔌 **Plugin System**
  - API para plugins de terceiros
  - Marketplace de plugins
  - SDK e docs
- 🛠️ **CLI Tools**
  - Task management via CLI
  - Bulk operations
  - Scripting support

## 🌐 v2.0 (Server + Multi-Client)
**CORE: Server mode + Desktop/Mobile/Web clients**

### 🖥️ **DailyTrim Server**
- 🐳 **Docker/Kubernetes Ready**
  - `docker-compose.yml` para deploy rápido
  - Helm chart para Kubernetes
  - Healthchecks e auto-restart
  - Backup automático configurável
- 💾 **Database Options**
  - SQLite (small teams <50 users)
  - PostgreSQL (enterprise scale)
  - Migrations automáticas
- 🔐 **Authentication & Authorization**
  - PocketBase como Identity Provider
  - OAuth2/OIDC para SSO
  - JWT tokens para clients
  - API keys para integrações
- 📡 **Real-time Infrastructure**
  - WebSocket server para collaboration
  - Presence system (online/offline/typing)
  - Conflict resolution (CRDT-based)
- 🔍 **Search & Indexing**
  - MeiliSearch sempre atualizado
  - Background indexing workers
  - Search analytics

### 📱 **Mobile Client** (React Native)
- ✅ **Core Features**
  - Login via server (ou local standalone)
  - Task management completo
  - Document viewer/editor (básico)
  - Push notifications
- 📴 **Offline-first**
  - Local SQLite cache
  - Bidirectional sync
  - Conflict resolution UI
- 📸 **Mobile-specific**
  - Camera integration (scan docs, fotos)
  - Voice recording (para transcription server-side)
  - Biometric authentication
  - Widget para quick task add

### 🌍 **Web Client** (PWA)
- 🌐 **Progressive Web App**
  - React (mesma codebase do Desktop frontend?)
  - Service Workers (offline cache)
  - Install prompt
  - Desktop notifications
- ⚡ **Performance**
  - Code splitting
  - Lazy loading
  - Optimistic UI updates
- 🎨 **Responsive Design**
  - Desktop, tablet, mobile layouts
  - Touch-friendly em mobile

### 🔒 **Enterprise Features**
- 🏢 **Multi-tenancy**
  - Org isolation garantido
  - Per-org billing (se houver SaaS)
  - Custom domains (org.dailytrim.io)
- 📊 **Admin Dashboard**
  - User management
  - Audit logs (quem fez o quê)
  - Usage statistics
  - Storage quotas
- 🔐 **Advanced Security**
  - SSO via SAML/OIDC
  - 2FA obrigatório (opcional)
  - IP whitelisting
  - End-to-end encryption (futuro)
- 🔗 **API & Integrations**
  - REST API pública
  - GraphQL endpoint (opcional)
  - Webhooks bidirecionais
  - Rate limiting por org
  - SDK para integrações (JS, Python, Go)

### 📦 **Deployment Examples**

**Docker Compose (Small Team):**
```yaml
version: '3.8'
services:
  dailytrim-server:
    image: dailytrim/server:2.0
    environment:
      - ORG_ID=my_company
      - DB_TYPE=sqlite
  meilisearch:
    image: getmeili/meilisearch:latest
  n8n:
    image: n8nio/n8n:latest
```

**Kubernetes (Enterprise):**
```bash
helm repo add dailytrim https://charts.dailytrim.io
helm install dailytrim dailytrim/server \
  --set org.id=enterprise_corp \
  --set database.type=postgres \
  --set replicas=5
```

**Client Connection:**
```bash
# Desktop client connects to server
dailytrim-desktop.exe --server https://dailytrim.mycompany.com

# Mobile app: configure na primeira abertura
# Web: acessa direto https://dailytrim.mycompany.com
```

## 🔮 v3.0+ (Future Vision)
- 🧠 **Local LLM Integration** (llama.cpp)
  - Conversational AI assistant
  - Context-aware suggestions
  - Code generation para tasks técnicas
- 🔊 **Voice UI Completo**
  - Operação 100% por voz
  - TTS para respostas (Piper TTS?)
  - Multi-language support
- 🌐 **Federation**
  - Organizações podem se conectar
  - Compartilhamento cross-org (com permissões)
- 📊 **Advanced Analytics**
  - ML-powered insights
  - Predictive task completion
  - Team performance analytics
  - Burnout detection

---

## 💾 Estimativa de Tamanho

**Desktop App (v1.0 completo):**
- Binário Tauri/Rust: ~20MB
- PocketBase embedded: ~10MB
- MeiliSearch embedded: ~30MB
- Whisper.cpp + modelo tiny: ~85MB
- UI assets + cache: ~25MB
- **Total instalado: ~170MB** (muito menor que Slack/Discord)

**Instalador Windows:** ~200-250MB (comprimido)
