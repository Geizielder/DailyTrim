import { useState, useEffect } from 'react';
import { useMusicStore } from '../lib/musicStore';
import { navidrome } from '../lib/navidrome';
import CoverArtImage from './CoverArtImage';
import QueueDrawer from './QueueDrawer';
import {
  PlayFilled,
  PauseFilled,
  SkipForward,
  SkipBack,
  VolumeMute,
  VolumeUp,
  Shuffle,
  Repeat,
  RepeatOne,
  WarningAlt,
  Playlist,
} from '@carbon/icons-react';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    isServerAvailable,
    playPause,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = useMusicStore();

  // Keyboard shortcuts - MUST be before any conditional return
  useEffect(() => {
    if (!currentSong) return; // Don't add listeners if no song

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case ' ': // Space - Play/Pause
          e.preventDefault();
          playPause();
          break;
        case 'ArrowLeft': // Left Arrow - Previous
          e.preventDefault();
          previous();
          break;
        case 'ArrowRight': // Right Arrow - Next
          e.preventDefault();
          next();
          break;
        case 'ArrowUp': // Up Arrow - Volume Up
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown': // Down Arrow - Volume Down
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'q':
        case 'Q': // Q - Toggle Queue
          e.preventDefault();
          setIsQueueOpen(!isQueueOpen);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSong, playPause, next, previous, volume, setVolume, isQueueOpen]);

  if (!currentSong) {
    return null; // Don't show player if no song is loaded
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const coverUrl = currentSong.coverArt
    ? navidrome.getCoverArtUrl(currentSong.coverArt, 80)
    : '';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90px',
        backgroundColor: '#262626',
        borderTop: '1px solid #393939',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        gap: '1rem',
        zIndex: 9000,
      }}
    >
      {/* Song Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '250px' }}>
        {coverUrl ? (
          <CoverArtImage
            src={coverUrl}
            alt={currentSong.album || currentSong.title}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '4px',
              objectFit: 'cover',
            }}
            timeout={5000}
          />
        ) : (
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '4px',
              backgroundColor: '#393939',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8d8d8d',
              fontSize: '1.5rem',
            }}
          >
            {currentSong.title.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: '#f4f4f4',
              fontSize: '0.875rem',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentSong.title}
          </div>
          <div
            style={{
              color: '#8d8d8d',
              fontSize: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentSong.artist}
          </div>
        </div>
        {!isServerAvailable && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#da1e28',
              fontSize: '0.75rem',
              paddingRight: '0.5rem',
            }}
            title="Servidor Navidrome indisponível"
          >
            <WarningAlt size={16} />
            <span>Offline</span>
          </div>
        )}
      </div>

      {/* Player Controls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button
            onClick={toggleShuffle}
            style={{
              background: 'transparent',
              border: 'none',
              color: shuffle ? '#0f62fe' : '#8d8d8d',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            title="Shuffle"
          >
            <Shuffle size={20} />
          </button>

          <button
            onClick={previous}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f4f4f4',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            title="Previous"
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={playPause}
            style={{
              background: '#f4f4f4',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseFilled size={16} /> : <PlayFilled size={16} />}
          </button>

          <button
            onClick={next}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f4f4f4',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            title="Next"
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={toggleRepeat}
            style={{
              background: 'transparent',
              border: 'none',
              color: repeat !== 'none' ? '#0f62fe' : '#8d8d8d',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            title="Repeat"
          >
            {repeat === 'one' ? <RepeatOne size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#8d8d8d', minWidth: '40px' }}>
            {formatTime(currentTime)}
          </span>

          <div
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: '#393939',
              borderRadius: '2px',
              position: 'relative',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percent = x / rect.width;
              seek(percent * duration);
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#f4f4f4',
                borderRadius: '2px',
              }}
            />
          </div>

          <span style={{ fontSize: '0.75rem', color: '#8d8d8d', minWidth: '40px' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '150px' }}>
        <button
          onClick={() => setVolume(volume > 0 ? 0 : 1)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8d8d8d',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
        >
          {volume === 0 ? <VolumeMute size={20} /> : <VolumeUp size={20} />}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{
            flex: 1,
            cursor: 'pointer',
          }}
        />

        {/* Queue Button */}
        <button
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: isQueueOpen ? '#0f62fe' : '#8d8d8d',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
          title="Fila de reprodução"
        >
          <Playlist size={20} />
        </button>
      </div>

      {/* Queue Drawer */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </div>
  );
}
