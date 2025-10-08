import { useState, useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useMusicStore } from '../lib/musicStore';

interface CoverArtImageProps {
  src: string;
  alt: string;
  style?: CSSProperties;
  fallback?: ReactNode;
  timeout?: number; // Timeout em milissegundos (padrão: 5000ms)
}

export default function CoverArtImage({
  src,
  alt,
  style,
  fallback,
  timeout = 5000,
}: CoverArtImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const { setServerAvailable } = useMusicStore();

  useEffect(() => {
    if (!src) {
      setImageState('error');
      return;
    }

    setImageState('loading');
    let timeoutId: number;

    const img = new Image();

    const handleLoad = () => {
      clearTimeout(timeoutId);
      setImageState('loaded');
      // Only set available to true, don't change to false here
      // to avoid false positives from missing album art
    };

    const handleError = () => {
      clearTimeout(timeoutId);
      setImageState('error');
      // Don't mark server as unavailable for single image failures
      // Missing album art is common and doesn't mean server is down
    };

    // Timeout para considerar como erro
    timeoutId = window.setTimeout(() => {
      setImageState('error');
      // Don't mark server as unavailable on timeout
      // Could just be a slow image or missing album art
      img.src = ''; // Cancela o carregamento
    }, timeout);

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [src, timeout, setServerAvailable]);

  if (imageState === 'loading') {
    return (
      <div
        style={{
          ...style,
          backgroundColor: '#393939',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            border: '2px solid #8d8d8d',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (imageState === 'error') {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div
        style={{
          ...style,
          backgroundColor: '#393939',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8d8d8d',
          fontSize: '2rem',
        }}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return <img src={src} alt={alt} style={style} />;
}
