# 🗄️ PocketBase - DailyTrim Database

## 📋 Visão Geral

Este diretório contém o **PocketBase**, o banco de dados offline-first do DailyTrim.

- **SQLite** embutido (arquivo `pb_data/data.db`)
- **Migrations** versionadas em `pb_migrations/`
- **Admin UI** disponível em http://127.0.0.1:8090/_/

---

## 🚀 Setup Inicial (Primeiro Clone)

### 1. Baixar PocketBase

```bash
cd pocketbase

# Windows
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_windows_amd64.zip -o pb.zip
unzip pb.zip
rm pb.zip

# Linux
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip -o pb.zip
unzip pb.zip
rm pb.zip

# macOS
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_amd64.zip -o pb.zip
unzip pb.zip
rm pb.zip
```

### 2. Rodar Migrations

```bash
# Aplica todas migrations
./pocketbase migrate up

# Resultado esperado:
# Applied 1730560000_create_tasks.js
# Applied 1759510273_updated_tasks.js
# Applied 1759520000_create_navidrome_config.js
# Applied 1760000000_fix_navidrome_password_hidden.js
```

### 3. Criar Usuário Admin

```bash
# Inicia o servidor (primeira vez cria admin)
./pocketbase serve

# Acesse: http://127.0.0.1:8090/_/
# Crie o usuário admin quando solicitado
```

---

## 📊 Collections Criadas

Após rodar as migrations, você terá:

### 1. **users** (Sistema)
- Collection especial do PocketBase
- Autenticação de usuários

### 2. **tasks**
- Tarefas com status (todo, doing, done)
- Prioridades (low, medium, high)
- Timer Pomodoro (timeSpent)
- Owner (relation → users)

### 3. **navidrome_config**
- Configuração do servidor Navidrome
- URL, username, password (hidden!)
- Owner (relation → users)

---

## 🔧 Comandos Úteis

### Ver migrations aplicadas
```bash
./pocketbase migrate collections
```

### Rollback última migration
```bash
./pocketbase migrate down 1
```

### Criar nova migration
```bash
# Método 1: Via código (recomendado)
touch pb_migrations/$(date +%s)_minha_migration.js

# Método 2: Auto-gerar do Admin UI
./pocketbase migrate collections
# Edite via Admin UI, depois aceite criar migration
```

### Backup do banco
```bash
cp -r pb_data pb_data_backup_$(date +%Y%m%d)
```

### Resetar banco (CUIDADO!)
```bash
rm -rf pb_data
./pocketbase migrate up  # Recria limpo
```

---

## 📁 Estrutura de Arquivos

```
pocketbase/
├── pocketbase.exe          # Executável (não versionado)
├── pb_migrations/          # Migrations SQL/JS (VERSIONADO)
│   ├── 1730560000_create_tasks.js
│   ├── 1759510273_updated_tasks.js
│   ├── 1759520000_create_navidrome_config.js
│   └── 1760000000_fix_navidrome_password_hidden.js
├── pb_data/                # Banco SQLite (NÃO VERSIONADO)
│   ├── data.db            # Arquivo do banco
│   ├── logs.db            # Logs do sistema
│   └── backups/           # Backups automáticos
└── README.md              # Este arquivo
```

---

## 🔐 Segurança

### Senhas Protegidas
- Campo `password` em `navidrome_config` está **hidden**
- Pode ser definido (POST/PUT) mas nunca é retornado (GET)
- Armazenado em plaintext no SQLite (TODO: criptografar)

### Admin UI
- Protegido por login
- Apenas em desenvolvimento (localhost)
- **NÃO expor em produção** sem proxy reverso

### Backup
- `pb_data/` não está no Git (`.gitignore`)
- Fazer backup manual antes de migrations grandes
- PocketBase cria backups automáticos em `pb_data/backups/`

---

## 🚨 Troubleshooting

### Erro: "Collection already exists"
```bash
# Provavelmente migration já foi aplicada
./pocketbase migrate down 1  # Rollback
./pocketbase migrate up      # Reaplicar
```

### Erro: "Failed to load relation"
```bash
# Ordem errada das migrations
# Verifique que collections referenciadas existem antes
```

### Banco corrompido
```bash
# Rollback completo
rm -rf pb_data
./pocketbase migrate up
# Você perderá todos os dados!
```

### Migration não está sendo aplicada
```bash
# Verifique o nome do arquivo
ls pb_migrations/
# Deve começar com timestamp Unix (ex: 1730560000_*.js)
```

---

## 📚 Recursos

- [PocketBase Docs](https://pocketbase.io/docs/)
- [Migrations Guide](https://pocketbase.io/docs/migrations/)
- [Collections API](https://pocketbase.io/docs/collections/)
- [Schema do Projeto](../docs/POCKETBASE_SCHEMA.md)

---

## 🎯 Próximos Passos (v0.3)

Migrations futuras planejadas:
- `organizations` - Hierarquia de orgs
- `organization_members` - N:N com roles
- `workspaces` - Agrupamento de projetos
- `projects` - Projetos dentro de workspaces
- `documents` - Sistema de wiki/docs

Consulte `../docs/POCKETBASE_SCHEMA.md` para detalhes.

---

**Última atualização**: 2025-01-08
**Versão do PocketBase**: 0.22.0