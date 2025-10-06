import { useMusicStore } from '../lib/musicStore';
import { navidrome } from '../lib/navidrome';
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
} from '@carbon/icons-react';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    playPause,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = useMusicStore();

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
        {coverUrl && (
          <img
            src={coverUrl}
            alt={currentSong.album}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '4px',
              objectFit: 'cover',
            }}
          />
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
      </div>
    </div>
  );
}
