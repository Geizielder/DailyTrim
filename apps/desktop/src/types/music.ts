// Subsonic API Types

export interface Artist {
  id: string;
  name: string;
  albumCount: number;
  coverArt?: string;
  artistImageUrl?: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  coverArt?: string;
  songCount: number;
  duration: number;
  year?: number;
  genre?: string;
  created: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  coverArt?: string;
  duration: number;
  track?: number;
  year?: number;
  genre?: string;
  bitRate?: number;
  path: string;
  suffix: string;
  contentType: string;
  size: number;
}

export interface SearchResult {
  artists: Artist[];
  albums: Album[];
  songs: Song[];
}

// Navidrome Configuration
export interface NavidromeConfig {
  id?: string;
  server_url: string;
  username: string;
  password: string;
  token?: string;
  salt?: string;
  owner?: string;
  created?: string;
  updated?: string;
}

// Player State
export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
}

// API Response Types
export interface SubsonicResponse<T> {
  'subsonic-response': {
    status: 'ok' | 'failed';
    version: string;
    error?: {
      code: number;
      message: string;
    };
  } & T;
}

export interface ArtistsResponse {
  artists: {
    index: Array<{
      name: string;
      artist: Artist[];
    }>;
  };
}

export interface AlbumResponse {
  album: Album & {
    song: Song[];
  };
}

export interface SearchResponse {
  searchResult3: SearchResult;
}
