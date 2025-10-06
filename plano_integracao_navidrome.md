### 📊 Análise da Documentação

O **Navidrome** utiliza a **API Subsonic** para streaming de música, que oferece:
- ✅ Autenticação baseada em usuário/senha ou token
- ✅ Endpoints para listar artistas, álbuns e músicas
- ✅ Sistema de busca (`/rest/search3`)
- ✅ Streaming de áudio
- ✅ Controle de playlists
- ✅ Scrobbling (registro de reprodução)
  
  ---
- ## 🎯 Sequência de Tarefas para Implementação
- ### **Fase 1: Configuração e Autenticação**   🔐
  
  **Estimativa: 2-3 horas**
- **Criar modelo de configuração no PocketBase**
	- Collection: `navidrome_config`
	- Campos:
		- `server_url` (text)
		- `username` (text)
		- `password` (text, encrypted)
		- `token` (text, auto-generated)
		- `owner` (relation → users)
- **Criar página de configuração**
	- Formulário para inserir credenciais
	- Validação de conexão com servidor
	- Armazenamento seguro no PocketBase
	- Testes de autenticação
- **Criar serviço de autenticação**
	- `apps/desktop/src/lib/navidrome.ts`
	- Funções:
		- `authenticate()` - Gerar token/salt MD5
		- `ping()` - Testar conexão
		- `getAuthParams()` - Headers de autenticação
		  
		  ---
- ### **Fase 2: Biblioteca de Música**   🎵
  
  **Estimativa: 4-5 horas**
- **Criar interface de dados**
	- Types para Artist, Album, Song
	- Mapeamento da resposta Subsonic API
- **Implementar endpoints de biblioteca**
	- `getArtists()` - Listar artistas
	- `getAlbum(id)` - Detalhes do álbum
	- `getSongs(albumId)` - Músicas do álbum
	- `search(query)` - Busca global
- **Criar componente de biblioteca**
	- `apps/desktop/src/pages/Music.tsx`
	- Layout com:
		- Sidebar: Artistas
		- Main: Álbuns
		- Bottom: Player controls
- **Design com Carbon**
	- DataTable para listagens
	- Tiles para álbuns (com artwork)
	- Breadcrumbs para navegação
	- Search bar no toolbar
	  
	  ---
- ### **Fase 3: Player de Áudio**   🎧
  
  **Estimativa: 5-6 horas**
- **Criar serviço de reprodução**
	- `apps/desktop/src/lib/player.ts`
	- Controle do HTML5 Audio API
	- Estados: playing, paused, stopped
	- Fila de reprodução (queue)
- **Implementar controles do player**
	- Play/Pause
	- Next/Previous
	- Seek (barra de progresso)
	- Volume
	- Shuffle/Repeat
- **Componente de Player**
	- Player fixo na parte inferior
	- Design inspirado em Spotify/Apple Music
	- Exibir: artwork, título, artista, tempo
	- Controles visuais com ícones Carbon
- **Sistema de fila**
	- Lista de reprodução atual
	- Adicionar/remover músicas
	- Reordenar fila (drag & drop)
	- Persistência local (localStorage)
	  
	  ---
- ### **Fase 4: Features Avançadas**   ⭐
  
  **Estimativa: 3-4 horas**
- **Streaming otimizado**
	- Pré-carregamento (buffering)
	- Qualidade adaptativa
	- Cache de artwork
- **Integração com Tasks**
	- Música de fundo durante trabalho
	- Pausar automaticamente ao focar em tarefa
	- Timer musical (Pomodoro com música)
- **Scrobbling** (opcional)
	- Registrar músicas tocadas
	- Estatísticas de reprodução
	- Last.fm integration
- **Playlists**
	- Criar/editar playlists
	- Sincronizar com servidor
	- Favoritos
	  
	  ---
- ## 🗂️ Estrutura de Arquivos Proposta
  
  ```
  apps/desktop/src/
  ├── pages/
  │   ├── Music.tsx           # Página principal de música
  │   └── MusicSettings.tsx   # Configurações Navidrome
  ├── components/
  │   ├── MusicPlayer.tsx     # Player de áudio
  │   ├── AlbumGrid.tsx       # Grid de álbuns
  │   ├── ArtistList.tsx      # Lista de artistas
  │   ├── SongQueue.tsx       # Fila de reprodução
  │   └── NowPlaying.tsx      # Música atual
  ├── lib/
  │   ├── navidrome.ts        # API client
  │   ├── player.ts           # Lógica do player
  │   └── musicStore.ts       # Estado global (zustand?)
  └── types/
    └── music.ts            # Interfaces TypeScript
  ```
  
  ---
- ## 📦 Dependências Necessárias
  
  ```
  {
  "dependencies": {
    "@carbon/icons-react": "^11.x", // Já instalado
    "howler": "^2.2.4",             // Player de áudio robusto (opcional)
    "zustand": "^4.x"               // Estado global para player
  }
  }
  ```
  
  ---
- ## 🔒 Considerações de Segurança
- **Armazenamento de credenciais**
	- Senha nunca em plaintext
	- Token MD5 regenerado a cada sessão
	- Criptografia no PocketBase
- **HTTPS obrigatório**
	- Validar servidor usa HTTPS
	- Alertar se HTTP
- **CORS**
	- Configurar servidor Navidrome
	- Proxy reverso se necessário
	  
	  ---
- ## 🎨 Design UI/UX
  
  **Componentes Carbon sugeridos:**
- `DataTable` - Listagem de músicas
- `Tile` - Cards de álbuns com artwork
- `ProgressBar` - Barra de progresso da música
- `Button` (ghost/icon) - Controles do player
- `Modal` - Configurações e playlists
- `Search` - Busca de músicas
- `Accordion` - Lista de artistas expansível
  
  ---
- ## ✅ Critérios de Aceitação
- Usuário pode inserir credenciais Navidrome
- Listar todos os artistas da biblioteca
- Visualizar álbuns e músicas
- Reproduzir música com controles básicos
- Fila de reprodução funcional
- Busca por artista/álbum/música
- Design consistente com Carbon
- Persistência de configurações
- Tratamento de erros
  
  ---
- ## 📝 Próximos Passos
  
  **Você gostaria que eu comece implementando alguma fase específica?**
  
  
  
  Sugestões:
- Começar pela Fase 1 (Autenticação)
- Criar protótipo do Player (Fase 3)
- Implementar tudo em sequência