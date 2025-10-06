import { useState, useEffect } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  Search,
  Tile,
  Loading,
  InlineNotification,
} from '@carbon/react';
import { Settings, PlayFilled, Add } from '@carbon/icons-react';
import { useNavigate } from 'react-router-dom';
import { navidrome } from '../lib/navidrome';
import { useMusicStore } from '../lib/musicStore';
import MusicPlayer from '../components/MusicPlayer';
import type { Artist, Album, Song } from '../types/music';

export default function Music() {
  const navigate = useNavigate();
  const { setCurrentSong, addToQueue, clearQueue } = useMusicStore();

  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<(Album & { songs: Song[] }) | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    artists: Artist[];
    albums: Album[];
    songs: Song[];
  } | null>(null);

  useEffect(() => {
    checkConfiguration();
  }, []);

  async function checkConfiguration() {
    setIsLoading(true);
    try {
      const loaded = await navidrome.loadConfig();
      setIsConfigured(loaded);

      if (loaded) {
        // Test connection
        const isConnected = await navidrome.ping();
        if (isConnected) {
          await loadArtists();
        } else {
          setError('Não foi possível conectar ao servidor Navidrome. Verifique as configurações.');
        }
      }
    } catch (err) {
      console.error('Failed to check configuration:', err);
      setError('Erro ao carregar configuração');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadArtists() {
    try {
      setIsLoading(true);
      const data = await navidrome.getArtists();
      setArtists(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load artists:', err);
      setError('Erro ao carregar artistas');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleArtistClick(artist: Artist) {
    try {
      setIsLoading(true);
      setSelectedArtist(artist);
      setSelectedAlbum(null);
      setSearchResults(null);

      const albums = await navidrome.getArtistAlbums(artist.id);
      setArtistAlbums(albums);
      setError(null);
    } catch (err) {
      console.error('Failed to load artist albums:', err);
      setError('Erro ao carregar álbuns do artista');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAlbumClick(album: Album) {
    try {
      setIsLoading(true);
      const albumData = await navidrome.getAlbum(album.id);
      setSelectedAlbum(albumData);
      setError(null);
    } catch (err) {
      console.error('Failed to load album:', err);
      setError('Erro ao carregar álbum');
    } finally {
      setIsLoading(false);
    }
  }

  function handleBackToArtists() {
    setSelectedArtist(null);
    setArtistAlbums([]);
    setSelectedAlbum(null);
    setSearchResults(null);
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setIsLoading(true);
      const results = await navidrome.search(searchQuery);
      setSearchResults(results);
      setSelectedAlbum(null);
      setError(null);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Erro na busca');
    } finally {
      setIsLoading(false);
    }
  }

  function handlePlaySong(song: Song) {
    clearQueue();
    addToQueue([song]);
    setCurrentSong(song);
  }

  function handlePlayAlbum(songs: Song[]) {
    if (songs.length === 0) return;
    clearQueue();
    addToQueue(songs);
    setCurrentSong(songs[0]);
  }

  function handleAddToQueue(song: Song) {
    addToQueue([song]);
  }

  if (isLoading && !isConfigured) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loading description="Carregando..." />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div>
        <h1 style={{ marginBottom: '2rem' }}>Músicas</h1>

        <Tile
          style={{
            padding: '3rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Settings size={64} style={{ color: '#8d8d8d' }} />
          <h2>Configure o Navidrome</h2>
          <p style={{ color: '#8d8d8d', maxWidth: '40rem' }}>
            Para começar a usar o player de música, você precisa configurar suas credenciais do Navidrome.
          </p>
          <Button
            kind="primary"
            onClick={() => navigate('/music/settings')}
            renderIcon={Settings}
          >
            Ir para Configurações
          </Button>
        </Tile>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Biblioteca de Músicas</h1>
        <Button
          kind="tertiary"
          onClick={() => navigate('/music/settings')}
          renderIcon={Settings}
        >
          Configurações
        </Button>
      </div>

      {error && (
        <InlineNotification
          kind="error"
          title="Erro"
          subtitle={error}
          onCloseButtonClick={() => setError(null)}
          lowContrast
          style={{ marginBottom: '1rem' }}
        />
      )}

      <div style={{ marginBottom: '2rem' }}>
        <Search
          placeholder="Buscar músicas, artistas ou álbuns..."
          labelText="Buscar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loading description="Carregando..." />
        </div>
      ) : searchResults ? (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Resultados da Busca</h2>

          {searchResults.songs.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Músicas</h3>
              <DataTable
                rows={searchResults.songs.map((song, i) => ({ rowId: i.toString(), ...song }))}
                headers={[
                  { key: 'title', header: 'Título' },
                  { key: 'artist', header: 'Artista' },
                  { key: 'album', header: 'Álbum' },
                  { key: 'duration', header: 'Duração' },
                  { key: 'actions', header: '' },
                ]}
              >
                {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                  <TableContainer>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader {...getHeaderProps({ header })} key={header.key}>
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row, i) => {
                          const song = searchResults.songs[i];
                          return (
                            <TableRow {...getRowProps({ row })} key={song.id}>
                              <TableCell>{song.title}</TableCell>
                              <TableCell>{song.artist}</TableCell>
                              <TableCell>{song.album}</TableCell>
                              <TableCell>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</TableCell>
                              <TableCell>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <Button
                                    kind="ghost"
                                    size="sm"
                                    renderIcon={PlayFilled}
                                    onClick={() => handlePlaySong(song)}
                                    iconDescription="Play"
                                    hasIconOnly
                                  />
                                  <Button
                                    kind="ghost"
                                    size="sm"
                                    renderIcon={Add}
                                    onClick={() => handleAddToQueue(song)}
                                    iconDescription="Add to queue"
                                    hasIconOnly
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>
            </div>
          )}

          {searchResults.artists.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Artistas</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {searchResults.artists.map((artist) => (
                  <Tile
                    key={artist.id}
                    style={{ cursor: 'pointer', padding: '1rem', minWidth: '200px' }}
                    onClick={() => handleArtistClick(artist)}
                  >
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{artist.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#8d8d8d' }}>
                      {artist.albumCount} álbuns
                    </div>
                  </Tile>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : selectedAlbum ? (
        <div>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            {selectedAlbum.coverArt && (
              <img
                src={navidrome.getCoverArtUrl(selectedAlbum.coverArt, 300)}
                alt={selectedAlbum.name}
                style={{ width: '200px', height: '200px', borderRadius: '8px', objectFit: 'cover' }}
              />
            )}
            <div>
              <h2>{selectedAlbum.name}</h2>
              <p style={{ color: '#8d8d8d', marginTop: '0.5rem' }}>{selectedAlbum.artist}</p>
              {selectedAlbum.year && <p style={{ color: '#8d8d8d' }}>{selectedAlbum.year}</p>}
              <Button
                kind="primary"
                renderIcon={PlayFilled}
                onClick={() => handlePlayAlbum(selectedAlbum.songs)}
                style={{ marginTop: '1rem' }}
              >
                Tocar Álbum
              </Button>
            </div>
          </div>

          <DataTable
            rows={selectedAlbum.songs.map((song, i) => ({ rowId: i.toString(), ...song }))}
            headers={[
              { key: 'track', header: '#' },
              { key: 'title', header: 'Título' },
              { key: 'duration', header: 'Duração' },
              { key: 'actions', header: '' },
            ]}
          >
            {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
              <TableContainer>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, i) => {
                      const song = selectedAlbum.songs[i];
                      return (
                        <TableRow {...getRowProps({ row })} key={song.id}>
                          <TableCell>{song.track || i + 1}</TableCell>
                          <TableCell>{song.title}</TableCell>
                          <TableCell>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={PlayFilled}
                                onClick={() => handlePlaySong(song)}
                                iconDescription="Play"
                                hasIconOnly
                              />
                              <Button
                                kind="ghost"
                                size="sm"
                                renderIcon={Add}
                                onClick={() => handleAddToQueue(song)}
                                iconDescription="Add to queue"
                                hasIconOnly
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </div>
      ) : selectedArtist && artistAlbums.length > 0 ? (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <Button kind="ghost" onClick={handleBackToArtists}>
              ← Voltar para Artistas
            </Button>
          </div>

          <h2 style={{ marginBottom: '1rem' }}>{selectedArtist.name}</h2>
          <p style={{ color: '#8d8d8d', marginBottom: '2rem' }}>{artistAlbums.length} álbuns</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {artistAlbums.map((album) => (
              <Tile
                key={album.id}
                style={{ cursor: 'pointer', padding: '1rem' }}
                onClick={() => handleAlbumClick(album)}
              >
                {album.coverArt && (
                  <img
                    src={navidrome.getCoverArtUrl(album.coverArt, 200)}
                    alt={album.name}
                    style={{ width: '100%', borderRadius: '4px', marginBottom: '0.5rem' }}
                  />
                )}
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{album.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#8d8d8d' }}>
                  {album.year || 'Ano desconhecido'}
                </div>
              </Tile>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Artistas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {artists.map((artist) => (
              <Tile
                key={artist.id}
                style={{ cursor: 'pointer', padding: '1rem' }}
                onClick={() => handleArtistClick(artist)}
              >
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{artist.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#8d8d8d' }}>
                  {artist.albumCount} álbuns
                </div>
              </Tile>
            ))}
          </div>
        </div>
      )}

      <MusicPlayer />
    </div>
  );
}
