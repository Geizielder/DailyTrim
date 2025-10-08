import { useMusicStore } from '../lib/musicStore';
import { Close, TrashCan, PlayFilledAlt } from '@carbon/icons-react';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QueueDrawer({ isOpen, onClose }: QueueDrawerProps) {
  const { queue, currentSong, removeFromQueue, clearQueue, setCurrentSong, play } = useMusicStore();

  if (!isOpen) return null;

  const handleRemoveSong = (index: number) => {
    removeFromQueue(index);
  };

  const handleClearQueue = () => {
    if (window.confirm('Limpar toda a fila?')) {
      clearQueue();
    }
  };

  const handlePlaySong = (index: number) => {
    setCurrentSong(queue[index]);
    // Small delay to ensure song is set before playing
    setTimeout(() => play(), 50);
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          bottom: '90px', // Acima do player
          right: '1rem',
          width: '400px',
          maxHeight: '600px',
          backgroundColor: '#262626',
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 -2px 20px rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          transform: isOpen ? 'translateY(0)' : 'translateY(calc(100% + 90px))',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #393939',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: '1px solid #393939',
            backgroundColor: '#161616',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#f4f4f4' }}>
            Fila de Execução / {queue.length}
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleClearQueue}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8d8d8d',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Limpar fila"
            >
              <TrashCan size={20} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8d8d8d',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Fechar"
            >
              <Close size={20} />
            </button>
          </div>
        </div>

        {/* Queue List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem 0',
          }}
        >
          {queue.length === 0 ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#8d8d8d',
              }}
            >
              Nenhuma música na fila
            </div>
          ) : (
            queue.map((song, index) => {
              const isCurrentSong = currentSong?.id === song.id;
              return (
                <div
                  key={`${song.id}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    gap: '0.75rem',
                    backgroundColor: isCurrentSong ? '#393939' : 'transparent',
                    borderLeft: isCurrentSong ? '3px solid #0f62fe' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrentSong) {
                      e.currentTarget.style.backgroundColor = '#2c2c2c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentSong) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => handlePlaySong(index)}
                >
                  {/* Play Icon */}
                  <div style={{ minWidth: '20px' }}>
                    {isCurrentSong && (
                      <PlayFilledAlt size={16} style={{ color: '#0f62fe' }} />
                    )}
                  </div>

                  {/* Song Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: '#f4f4f4',
                        fontSize: '0.875rem',
                        fontWeight: isCurrentSong ? 600 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {song.title}
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
                      {song.artist}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSong(index);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#8d8d8d',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.7,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.color = '#da1e28';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                      e.currentTarget.style.color = '#8d8d8d';
                    }}
                    title="Remover da fila"
                  >
                    <Close size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
