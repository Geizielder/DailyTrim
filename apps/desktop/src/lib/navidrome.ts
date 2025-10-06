import { pb } from './pb';
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

// MD5 hash para autenticação Subsonic (implementação simples)
function md5(text: string): string {
  // Implementação básica de MD5 em JavaScript
  // Para produção, considere usar uma biblioteca como crypto-js

  // Por enquanto, vamos usar uma implementação inline simples
  function rotateLeft(value: number, shift: number): number {
    return (value << shift) | (value >>> (32 - shift));
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }

  function md5_F(x: number, y: number, z: number): number {
    return (x & y) | ((~x) & z);
  }

  function md5_G(x: number, y: number, z: number): number {
    return (x & z) | (y & (~z));
  }

  function md5_H(x: number, y: number, z: number): number {
    return x ^ y ^ z;
  }

  function md5_I(x: number, y: number, z: number): number {
    return y ^ (x | (~z));
  }

  function md5_FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(md5_F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function md5_GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(md5_G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function md5_HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(md5_H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function md5_II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(md5_I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(str: string): number[] {
    const wordArray: number[] = [];
    for (let i = 0; i < str.length * 8; i += 8) {
      wordArray[i >> 5] |= (str.charCodeAt(i / 8) & 0xFF) << (i % 32);
    }
    return wordArray;
  }

  function wordToHex(value: number): string {
    let str = '';
    for (let i = 0; i <= 3; i++) {
      str += ((value >> (i * 8 + 4)) & 0x0F).toString(16) + ((value >> (i * 8)) & 0x0F).toString(16);
    }
    return str;
  }

  const x = convertToWordArray(text);
  const len = text.length * 8;

  x[len >> 5] |= 0x80 << (len % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  let a = 0x67452301;
  let b = 0xEFCDAB89;
  let c = 0x98BADCFE;
  let d = 0x10325476;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5_FF(a, b, c, d, x[i + 0], 7, 0xD76AA478);
    d = md5_FF(d, a, b, c, x[i + 1], 12, 0xE8C7B756);
    c = md5_FF(c, d, a, b, x[i + 2], 17, 0x242070DB);
    b = md5_FF(b, c, d, a, x[i + 3], 22, 0xC1BDCEEE);
    a = md5_FF(a, b, c, d, x[i + 4], 7, 0xF57C0FAF);
    d = md5_FF(d, a, b, c, x[i + 5], 12, 0x4787C62A);
    c = md5_FF(c, d, a, b, x[i + 6], 17, 0xA8304613);
    b = md5_FF(b, c, d, a, x[i + 7], 22, 0xFD469501);
    a = md5_FF(a, b, c, d, x[i + 8], 7, 0x698098D8);
    d = md5_FF(d, a, b, c, x[i + 9], 12, 0x8B44F7AF);
    c = md5_FF(c, d, a, b, x[i + 10], 17, 0xFFFF5BB1);
    b = md5_FF(b, c, d, a, x[i + 11], 22, 0x895CD7BE);
    a = md5_FF(a, b, c, d, x[i + 12], 7, 0x6B901122);
    d = md5_FF(d, a, b, c, x[i + 13], 12, 0xFD987193);
    c = md5_FF(c, d, a, b, x[i + 14], 17, 0xA679438E);
    b = md5_FF(b, c, d, a, x[i + 15], 22, 0x49B40821);
    a = md5_GG(a, b, c, d, x[i + 1], 5, 0xF61E2562);
    d = md5_GG(d, a, b, c, x[i + 6], 9, 0xC040B340);
    c = md5_GG(c, d, a, b, x[i + 11], 14, 0x265E5A51);
    b = md5_GG(b, c, d, a, x[i + 0], 20, 0xE9B6C7AA);
    a = md5_GG(a, b, c, d, x[i + 5], 5, 0xD62F105D);
    d = md5_GG(d, a, b, c, x[i + 10], 9, 0x02441453);
    c = md5_GG(c, d, a, b, x[i + 15], 14, 0xD8A1E681);
    b = md5_GG(b, c, d, a, x[i + 4], 20, 0xE7D3FBC8);
    a = md5_GG(a, b, c, d, x[i + 9], 5, 0x21E1CDE6);
    d = md5_GG(d, a, b, c, x[i + 14], 9, 0xC33707D6);
    c = md5_GG(c, d, a, b, x[i + 3], 14, 0xF4D50D87);
    b = md5_GG(b, c, d, a, x[i + 8], 20, 0x455A14ED);
    a = md5_GG(a, b, c, d, x[i + 13], 5, 0xA9E3E905);
    d = md5_GG(d, a, b, c, x[i + 2], 9, 0xFCEFA3F8);
    c = md5_GG(c, d, a, b, x[i + 7], 14, 0x676F02D9);
    b = md5_GG(b, c, d, a, x[i + 12], 20, 0x8D2A4C8A);
    a = md5_HH(a, b, c, d, x[i + 5], 4, 0xFFFA3942);
    d = md5_HH(d, a, b, c, x[i + 8], 11, 0x8771F681);
    c = md5_HH(c, d, a, b, x[i + 11], 16, 0x6D9D6122);
    b = md5_HH(b, c, d, a, x[i + 14], 23, 0xFDE5380C);
    a = md5_HH(a, b, c, d, x[i + 1], 4, 0xA4BEEA44);
    d = md5_HH(d, a, b, c, x[i + 4], 11, 0x4BDECFA9);
    c = md5_HH(c, d, a, b, x[i + 7], 16, 0xF6BB4B60);
    b = md5_HH(b, c, d, a, x[i + 10], 23, 0xBEBFBC70);
    a = md5_HH(a, b, c, d, x[i + 13], 4, 0x289B7EC6);
    d = md5_HH(d, a, b, c, x[i + 0], 11, 0xEAA127FA);
    c = md5_HH(c, d, a, b, x[i + 3], 16, 0xD4EF3085);
    b = md5_HH(b, c, d, a, x[i + 6], 23, 0x04881D05);
    a = md5_HH(a, b, c, d, x[i + 9], 4, 0xD9D4D039);
    d = md5_HH(d, a, b, c, x[i + 12], 11, 0xE6DB99E5);
    c = md5_HH(c, d, a, b, x[i + 15], 16, 0x1FA27CF8);
    b = md5_HH(b, c, d, a, x[i + 2], 23, 0xC4AC5665);
    a = md5_II(a, b, c, d, x[i + 0], 6, 0xF4292244);
    d = md5_II(d, a, b, c, x[i + 7], 10, 0x432AFF97);
    c = md5_II(c, d, a, b, x[i + 14], 15, 0xAB9423A7);
    b = md5_II(b, c, d, a, x[i + 5], 21, 0xFC93A039);
    a = md5_II(a, b, c, d, x[i + 12], 6, 0x655B59C3);
    d = md5_II(d, a, b, c, x[i + 3], 10, 0x8F0CCC92);
    c = md5_II(c, d, a, b, x[i + 10], 15, 0xFFEFF47D);
    b = md5_II(b, c, d, a, x[i + 1], 21, 0x85845DD1);
    a = md5_II(a, b, c, d, x[i + 8], 6, 0x6FA87E4F);
    d = md5_II(d, a, b, c, x[i + 15], 10, 0xFE2CE6E0);
    c = md5_II(c, d, a, b, x[i + 6], 15, 0xA3014314);
    b = md5_II(b, c, d, a, x[i + 13], 21, 0x4E0811A1);
    a = md5_II(a, b, c, d, x[i + 4], 6, 0xF7537E82);
    d = md5_II(d, a, b, c, x[i + 11], 10, 0xBD3AF235);
    c = md5_II(c, d, a, b, x[i + 2], 15, 0x2AD7D2BB);
    b = md5_II(b, c, d, a, x[i + 9], 21, 0xEB86D391);

    a = addUnsigned(a, olda);
    b = addUnsigned(b, oldb);
    c = addUnsigned(c, oldc);
    d = addUnsigned(d, oldd);
  }

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

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

      const records = await pb.collection('navidrome_config').getList(1, 1, {
        filter: `owner = "${userId}"`,
      });

      if (records.items.length > 0) {
        this.config = records.items[0] as unknown as NavidromeConfig;
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

      // Check if config exists
      const existing = await pb.collection('navidrome_config').getList(1, 1, {
        filter: `owner = "${userId}"`,
      });

      const configData = {
        server_url: serverUrl,
        username: username,
        password: password,
        owner: userId,
      };

      if (existing.items.length > 0) {
        // Update existing
        this.config = await pb.collection('navidrome_config').update(
          existing.items[0].id,
          configData
        ) as unknown as NavidromeConfig;
      } else {
        // Create new
        this.config = await pb.collection('navidrome_config').create(
          configData
        ) as unknown as NavidromeConfig;
      }
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

  private getAuthParams(): URLSearchParams {
    if (!this.config) {
      throw new Error('Navidrome not configured');
    }

    // Generate salt and token for this session
    if (!this.authSalt || !this.authToken) {
      this.authSalt = generateSalt();
      this.authToken = md5(this.config.password + this.authSalt);
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

    const params = this.getAuthParams();

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
        this.config = { server_url: serverUrl, username, password };
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

    return artists;
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
