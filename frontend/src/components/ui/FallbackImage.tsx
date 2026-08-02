/* eslint-disable @next/next/no-img-element */
'use client'
import { useState } from 'react';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export default function FallbackImage({ src, alt, className, fallbackSrc, ...props }: FallbackImageProps) {
  const defaultFallback = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
  const [imgSrc, setImgSrc] = useState(src || defaultFallback);

  return (
    <img 
      {...props}
      src={imgSrc as string} 
      alt={alt || "Image"} 
      className={className} 
      onError={() => setImgSrc(fallbackSrc || defaultFallback)} 
    />
  );
}
