import { create } from 'zustand';
import type { Song, PlayerState } from '../types/music';
import { navidrome } from './navidrome';

interface MusicStore extends PlayerState {
  // Audio element
  audio: HTMLAudioElement | null;

  // Actions
  setCurrentSong: (song: Song | null) => void;
  addToQueue: (songs: Song[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playPause: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCurrentTime: (currentTime: number) => void;
  setDuration: (trackDuration: number) => void;
  initAudio: () => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  // Initial state
  currentSong: null,
  queue: [],
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  shuffle: false,
  repeat: 'none',
  audio: null,

  // Initialize audio element
  initAudio: () => {
    const audio = new Audio();
    audio.volume = 1;

    // Event listeners
    audio.addEventListener('timeupdate', () => {
      set({ currentTime: audio.currentTime });
    });

    audio.addEventListener('durationchange', () => {
      set({ duration: audio.duration || 0 });
    });

    audio.addEventListener('ended', () => {
      const state = get();
      if (state.repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        get().next();
      }
    });

    audio.addEventListener('play', () => {
      set({ isPlaying: true, isPaused: false });
    });

    audio.addEventListener('pause', () => {
      set({ isPlaying: false, isPaused: true });
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      set({ isPlaying: false, isPaused: false });
    });

    set({ audio });
  },

  setCurrentSong: (song) => {
    const { audio } = get();
    if (!audio) return;

    set({ currentSong: song, currentTime: 0, duration: 0 });

    if (song) {
      try {
        const streamUrl = navidrome.getStreamUrl(song.id);
        audio.src = streamUrl;
        audio.load();
      } catch (error) {
        console.error('Failed to set song:', error);
      }
    } else {
      audio.src = '';
      audio.load();
    }
  },

  addToQueue: (songs) => {
    set((state) => ({
      queue: [...state.queue, ...songs],
    }));
  },

  removeFromQueue: (index) => {
    set((state) => ({
      queue: state.queue.filter((_, i) => i !== index),
    }));
  },

  clearQueue: () => {
    set({ queue: [] });
  },

  playPause: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  play: () => {
    const { audio, currentSong } = get();
    if (!audio) return;

    if (currentSong) {
      audio.play().catch((error) => {
        console.error('Failed to play:', error);
      });
    }
  },

  pause: () => {
    const { audio } = get();
    if (!audio) return;
    audio.pause();
  },

  stop: () => {
    const { audio } = get();
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    set({ isPlaying: false, isPaused: false, currentTime: 0 });
  },

  next: () => {
    const { queue, currentSong, shuffle, repeat } = get();
    if (queue.length === 0) return;

    let nextIndex = 0;
    if (currentSong) {
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
      if (shuffle) {
        // Random song (excluding current)
        const availableIndices = queue
          .map((_, i) => i)
          .filter((i) => i !== currentIndex);
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      } else {
        nextIndex = (currentIndex + 1) % queue.length;
      }
    }

    const nextSong = queue[nextIndex];
    if (nextSong) {
      get().setCurrentSong(nextSong);
      get().play();
    } else if (repeat === 'all') {
      get().setCurrentSong(queue[0]);
      get().play();
    }
  },

  previous: () => {
    const { queue, currentSong, currentTime } = get();
    if (queue.length === 0) return;

    // If more than 3 seconds played, restart current song
    if (currentTime > 3) {
      get().seek(0);
      return;
    }

    if (currentSong) {
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
      const prevSong = queue[prevIndex];

      if (prevSong) {
        get().setCurrentSong(prevSong);
        get().play();
      }
    } else if (queue.length > 0) {
      get().setCurrentSong(queue[queue.length - 1]);
      get().play();
    }
  },

  seek: (time) => {
    const { audio } = get();
    if (!audio) return;
    audio.currentTime = time;
    set({ currentTime: time });
  },

  setVolume: (volume) => {
    const { audio } = get();
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume));
    set({ volume: audio.volume });
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  toggleRepeat: () => {
    set((state) => {
      const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
      const currentIndex = modes.indexOf(state.repeat);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { repeat: modes[nextIndex] };
    });
  },

  setCurrentTime: (currentTime) => {
    set({ currentTime });
  },

  setDuration: (trackDuration) => {
    set({ duration: trackDuration });
  },
}));

// Initialize audio on first import
if (typeof window !== 'undefined') {
  useMusicStore.getState().initAudio();
}
