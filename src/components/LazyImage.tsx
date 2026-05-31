import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackColor?: string;
  draggable?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  fallbackColor = '#e5e7eb',
  draggable = false,
  onContextMenu,
  onClick,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer — only load image when it's near the viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Start loading
          const img = imgRef.current;
          if (img) img.src = src;
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' }, // Start loading 200px before entering viewport
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [src]);

  if (!src || error) {
    return null; // Parent should handle the fallback icon
  }

  return (
    <div ref={containerRef} className={'relative ' + className} onClick={onClick}>
      {/* Shimmer placeholder while loading */}
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse rounded-inherit"
          style={{ backgroundColor: fallbackColor }}
        />
      )}
      <img
        ref={imgRef}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        draggable={draggable}
        onContextMenu={onContextMenu}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
