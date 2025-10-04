# Documentação de Navegação - Daily Trim

## Visão Geral

A aplicação Daily Trim utiliza o **Carbon Design System** com componentes de **UI Shell** para fornecer uma navegação consistente e intuitiva entre as diferentes seções da aplicação.

## Estrutura de Navegação

### Componentes Principais

#### 1. Layout Component (`src/components/Layout.tsx`)

O componente `Layout` é responsável por encapsular todas as páginas protegidas (autenticadas) da aplicação, fornecendo:

- **Header**: Barra superior com nome da aplicação e navegação horizontal
- **SideNav**: Barra lateral com links de navegação e ícones
- **Main Content Area**: Área principal onde o conteúdo das páginas é renderizado

**Estrutura:**
```tsx
<Layout>
  <Header />
  <SideNav />
  <main>{children}</main>
</Layout>
```

#### 2. Rotas Disponíveis

| Rota | Componente | Descrição | Ícone |
|------|-----------|-----------|-------|
| `/dashboard` | `Dashboard` | Estatísticas gerais e visão geral | Dashboard |
| `/tasks` | `Tasks` | Gerenciamento de tarefas | TaskView |
| `/music` | `Music` | Player de música (Navidrome) | Music |
| `/settings` | `Settings` | Configurações gerais | Settings |

#### 3. Rotas Públicas (sem Layout)

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | `Login` | Página de login |
| `/register` | `Register` | Página de registro |

## Páginas

### Dashboard (`src/pages/Dashboard.tsx`)

**Propósito**: Exibir estatísticas gerais sobre as tarefas do usuário.

**Funcionalidades**:
- Total de tarefas
- Tarefas por status (A Fazer, Em Progresso, Concluído)
- Tempo total gasto em todas as tarefas
- Cards visuais com ícones coloridos

**Integração**: Conecta-se ao PocketBase para buscar dados de tarefas e calcular estatísticas.

**Componentes Carbon utilizados**:
- `Grid` / `Column`: Layout responsivo
- `Tile`: Cards de estatísticas
- `SkeletonText`: Loading state

### Tasks (`src/pages/Task.tsx`)

**Propósito**: Gerenciar tarefas com interface completa de CRUD.

**Funcionalidades**:
- DataTable com colunas configuráveis
- Busca e filtros
- Timer integrado para rastreamento de tempo
- Edição inline de status
- Modal para criar/editar tarefas
- Paginação (10, 20, 30, 50 itens por página)
- Ações: editar, deletar

**Componentes Carbon utilizados**:
- `DataTable`: Tabela principal
- `Modal`: Formulários
- `Dropdown`: Seleção de status e prioridade
- `Button`: Ações
- `Pagination`: Navegação entre páginas

### Music (`src/pages/Music.tsx`)

**Propósito**: Integração com servidor Navidrome para streaming de música.

**Status**: Placeholder - implementação futura

**Funcionalidades planejadas**:
- Autenticação com servidor Navidrome
- Listagem de biblioteca de músicas
- Player de áudio
- Playlists
- Controles de reprodução

### Settings (`src/pages/Settings.tsx`)

**Propósito**: Configurações gerais da aplicação.

**Funcionalidades**:
- Accordion com seções organizadas:
  - **Geral**: Configurações da aplicação
  - **Navidrome**: Credenciais do servidor de música
  - **Perfil**: Informações do usuário

**Componentes Carbon utilizados**:
- `Accordion` / `AccordionItem`: Organização de seções
- `Tile`: Containers de conteúdo

## Implementação Técnica

### React Router v6

A navegação utiliza `react-router-dom` versão 6:

```tsx
<BrowserRouter>
  <Routes>
    {/* Rotas públicas */}
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Rotas protegidas com Layout */}
    <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
    <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
    <Route path="/music" element={<Layout><Music /></Layout>} />
    <Route path="/settings" element={<Layout><Settings /></Layout>} />
  </Routes>
</BrowserRouter>
```

### Navegação Programática

O componente `Layout` utiliza hooks do React Router para navegação:

```tsx
import { useLocation, useNavigate } from "react-router-dom";

const location = useLocation();
const navigate = useNavigate();

// Navegar para uma rota
navigate("/dashboard");

// Verificar rota atual
location.pathname === "/tasks"
```

### Estado Ativo

Os links de navegação mostram visualmente qual página está ativa usando:

```tsx
isActive={location.pathname === item.path}
isCurrentPage={location.pathname === item.path}
```

## Carbon Design System - UI Shell

### Header

Componente fixo no topo com:
- `HeaderName`: Nome da aplicação
- `HeaderNavigation`: Links de navegação horizontal
- `HeaderMenuItem`: Itens individuais do menu

### SideNav

Barra lateral com:
- `SideNav`: Container principal (fixo, sempre expandido)
- `SideNavItems`: Container de links
- `SideNavLink`: Links com ícones e labels

### Ícones

Todos os ícones vêm do pacote `@carbon/icons-react`:

```tsx
import {
  Dashboard,
  TaskView,
  Music,
  Settings,
} from "@carbon/icons-react";
```

## Fluxo de Autenticação

1. Usuário acessa `/` (Login)
2. Após autenticação bem-sucedida, redirecionar para `/dashboard`
3. Usuário navega livremente entre rotas protegidas
4. Logout retorna para `/`

**Nota**: A implementação de proteção de rotas (route guards) pode ser adicionada futuramente usando um componente `ProtectedRoute`.

## Estilização

### Layout Principal

```tsx
<div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
  <Header />
  <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
    <SideNav style={{ minWidth: "16rem" }} />
    <main style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
      {children}
    </main>
  </div>
</div>
```

### Responsividade

O Carbon Grid System é utilizado nas páginas:

```tsx
<Grid>
  <Column lg={4} md={4} sm={4}>
    {/* Conteúdo */}
  </Column>
</Grid>
```

Breakpoints:
- `sm`: Small (mobile)
- `md`: Medium (tablet)
- `lg`: Large (desktop)

## Próximos Passos

1. **Implementar autenticação de rotas**: Proteger rotas que requerem login
2. **Adicionar breadcrumbs**: Mostrar caminho de navegação
3. **Implementar Navidrome**: Funcionalidade completa de música
4. **Adicionar notificações**: Toast notifications para ações do usuário
5. **Dark mode**: Tema escuro usando Carbon tokens
6. **Internacionalização**: Suporte a múltiplos idiomas

## Referências

- [Carbon Design System](https://carbondesignsystem.com/)
- [Carbon UI Shell](https://carbondesignsystem.com/components/UI-shell-header/usage/)
- [React Router v6](https://reactrouter.com/en/main)
- [PocketBase SDK](https://github.com/pocketbase/js-sdk)