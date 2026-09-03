/* eslint-disable @next/next/no-img-element */
'use client'
import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { getImageUrl } from '@/lib/utils';

interface FallbackImageProps extends Omit<ImageProps, 'src' | 'alt' | 'fill'> {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
  className?: string;
}

export default function FallbackImage({ src, alt, className, fallbackSrc, ...props }: FallbackImageProps) {
  const defaultFallback = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
  const initialSrc = getImageUrl(src as string) || defaultFallback;
  const [imgSrc, setImgSrc] = useState(initialSrc);

  useEffect(() => {
    setImgSrc(getImageUrl(src as string) || defaultFallback);
  }, [src]);

  return (
    <Image 
      {...props}
      src={imgSrc as string} 
      alt={alt || "Image"} 
      fill
      unoptimized={true}
      className={`object-cover ${className || ''}`} 
      onError={() => setImgSrc(fallbackSrc || defaultFallback)}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO88B8AAqUB0Y/O4b0AAAAASUVORK5CYII="
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
