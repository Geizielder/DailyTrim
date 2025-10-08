import { pb } from './pb';
import { invoke } from '@tauri-apps/api/core';
import type {
  SubsonicResponse,
  ArtistsResponse,
  AlbumResponse,
  SearchResponse,
  Artist,
  Album,
  Song,
  NavidromeConfig,
} from '../types/music';

// Generate random salt
function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Navidrome Client Class
class NavidromeClient {
  private config: NavidromeConfig | null = null;
  private authToken: string | null = null;
  private authSalt: string | null = null;

  async loadConfig(): Promise<boolean> {
    try {
      const userId = pb.authStore.record?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const authToken = pb.authStore.token;
      const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

      // Chama comando Rust para buscar config (senha já vem criptografada)
      const config = await invoke<NavidromeConfig | null>('get_navidrome_config', {
        pocketbaseUrl,
        authToken,
        ownerId: userId,
      });

      if (config) {
        this.config = config;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load Navidrome config:', error);
      return false;
    }
  }

  async saveConfig(serverUrl: string, username: string, password: string): Promise<void> {
    try {
      const userId = pb.authStore.record?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Test connection first
      const isValid = await this.testConnection(serverUrl, username, password);
      if (!isValid) {
        throw new Error('Failed to connect to Navidrome server');
      }

      const authToken = pb.authStore.token;
      const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

      // Chama comando Rust que criptografa a senha antes de salvar
      this.config = await invoke<NavidromeConfig>('save_navidrome_config', {
        pocketbaseUrl,
        authToken,
        configId: this.config?.id || null,
        serverUrl,
        username,
        password, // Plaintext apenas neste momento, Rust criptografa antes de salvar
        ownerId: userId,
      });

      // Limpa token antigo para forçar regeneração
      this.authToken = null;
      this.authSalt = null;
    } catch (error) {
      console.error('Failed to save Navidrome config:', error);
      throw error;
    }
  }

  async deleteConfig(): Promise<void> {
    try {
      const userId = pb.authStore.record?.id;
      if (!userId) return;

      const existing = await pb.collection('navidrome_config').getList(1, 1, {
        filter: `owner = "${userId}"`,
      });

      if (existing.items.length > 0) {
        await pb.collection('navidrome_config').delete(existing.items[0].id);
        this.config = null;
        this.authToken = null;
        this.authSalt = null;
      }
    } catch (error) {
      console.error('Failed to delete config:', error);
    }
  }

  private async getAuthParams(): Promise<URLSearchParams> {
    if (!this.config) {
      throw new Error('Navidrome not configured');
    }

    // Generate salt and token for this session
    if (!this.authSalt || !this.authToken) {
      this.authSalt = generateSalt();

      // Chama comando Rust que descriptografa senha e gera token (senha nunca sai do Rust)
      this.authToken = await invoke<string>('generate_navidrome_auth', {
        encryptedPassword: this.config.encrypted_password,
        salt: this.authSalt,
      });
    }

    const params = new URLSearchParams({
      u: this.config.username,
      t: this.authToken,
      s: this.authSalt,
      v: '1.16.1', // Subsonic API version
      c: 'DailyTrim', // Client name
      f: 'json',
    });

    return params;
  }

  private async apiRequest<T>(endpoint: string, extraParams?: Record<string, string>): Promise<T> {
    if (!this.config) {
      throw new Error('Navidrome not configured. Please configure it in Settings.');
    }

    const params = await this.getAuthParams();

    // Add extra params
    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    const url = `${this.config.server_url}/rest/${endpoint}?${params.toString()}`;

    console.log('Navidrome API Request:', endpoint, url);

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP Error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: SubsonicResponse<T> = await response.json();
    console.log('Navidrome API Response:', data);

    if (data['subsonic-response'].status === 'failed') {
      const error = data['subsonic-response'].error;
      console.error('Subsonic API Error:', error);
      throw new Error(error?.message || 'Unknown Subsonic API error');
    }

    return data['subsonic-response'] as T;
  }

  async testConnection(serverUrl?: string, username?: string, password?: string): Promise<boolean> {
    try {
      const tempConfig = this.config;
      const tempToken = this.authToken;
      const tempSalt = this.authSalt;

      // Use provided credentials for testing or fall back to stored config
      if (serverUrl && username && password) {
        // Para teste, criptografa a senha temporariamente
        const encryptedPassword = await invoke<string>('encrypt_password_only', {
          password,
        });

        this.config = {
          server_url: serverUrl,
          username,
          encrypted_password: encryptedPassword
        };
        this.authToken = null;
        this.authSalt = null;
      }

      await this.apiRequest('ping');

      // Restore previous config if we were testing
      if (serverUrl) {
        this.config = tempConfig;
        this.authToken = tempToken;
        this.authSalt = tempSalt;
      }

      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.apiRequest('ping');
      return true;
    } catch (error) {
      console.error('Ping failed:', error);
      return false;
    }
  }

  async getArtists(): Promise<Artist[]> {
    const response = await this.apiRequest<ArtistsResponse>('getArtists');
    const artists: Artist[] = [];

    response.artists.index.forEach(index => {
      artists.push(...index.artist);
    });

    // Para artistas sem coverArt ou artistImageUrl, buscar do primeiro álbum
    const artistsWithCovers = await Promise.all(
      artists.map(async (artist) => {
        // Se já tem imagem, retorna como está
        if (artist.coverArt || artist.artistImageUrl) {
          return artist;
        }

        try {
          // Busca os álbuns do artista para pegar coverArt do primeiro
          const artistData = await this.apiRequest<{ artist: Artist & { album: Album[] } }>('getArtist', { id: artist.id });
          const firstAlbumWithCover = artistData.artist.album?.find(album => album.coverArt);

          if (firstAlbumWithCover?.coverArt) {
            return { ...artist, coverArt: firstAlbumWithCover.coverArt };
          }
        } catch (error) {
          console.warn('Failed to fetch cover for artist:', artist.id, error);
        }

        return artist;
      })
    );

    return artistsWithCovers;
  }

  async getArtistAlbums(artistId: string): Promise<Album[]> {
    const response = await this.apiRequest<{ artist: Artist & { album: Album[] } }>('getArtist', { id: artistId });
    const albums = response.artist.album || [];

    // Para álbuns sem coverArt (Unknown Album), buscar da primeira música
    const albumsWithCovers = await Promise.all(
      albums.map(async (album) => {
        // Se já tem coverArt ou não é Unknown Album, retorna como está
        if (album.coverArt || album.name !== '[Unknown Album]') {
          return album;
        }

        try {
          // Busca as músicas do álbum para pegar o coverArt da primeira
          const albumData = await this.getAlbum(album.id);
          const firstSongWithCover = albumData.songs.find(song => song.coverArt);

          if (firstSongWithCover?.coverArt) {
            return { ...album, coverArt: firstSongWithCover.coverArt };
          }
        } catch (error) {
          console.warn('Failed to fetch cover for unknown album:', album.id, error);
        }

        return album;
      })
    );

    return albumsWithCovers;
  }

  async getAlbum(id: string): Promise<Album & { songs: Song[] }> {
    const response = await this.apiRequest<AlbumResponse>('getAlbum', { id });
    return {
      ...response.album,
      songs: response.album.song || [],
    };
  }

  async search(query: string): Promise<{ artists: Artist[], albums: Album[], songs: Song[] }> {
    const response = await this.apiRequest<SearchResponse>('search3', { query });
    return response.searchResult3;
  }

  getStreamUrl(songId: string): string {
    if (!this.config || !this.authToken || !this.authSalt) {
      throw new Error('Not authenticated');
    }

    const params = new URLSearchParams({
      id: songId,
      u: this.config.username,
      t: this.authToken,
      s: this.authSalt,
      v: '1.16.1',
      c: 'DailyTrim',
    });

    return `${this.config.server_url}/rest/stream?${params.toString()}`;
  }

  getCoverArtUrl(coverArtId: string, size: number = 300): string {
    if (!this.config || !this.authToken || !this.authSalt) {
      return '';
    }

    const params = new URLSearchParams({
      id: coverArtId,
      size: size.toString(),
      u: this.config.username,
      t: this.authToken,
      s: this.authSalt,
      v: '1.16.1',
      c: 'DailyTrim',
    });

    return `${this.config.server_url}/rest/getCoverArt?${params.toString()}`;
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  getConfig(): NavidromeConfig | null {
    return this.config;
  }
}

// Export singleton instance
export const navidrome = new NavidromeClient();
