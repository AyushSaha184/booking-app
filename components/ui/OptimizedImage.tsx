'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder'> {
  /** Aspect ratio wrapper class, e.g. "aspect-video" or "aspect-square" */
  aspectClass?: string
  /** Extra class on the wrapper div */
  wrapperClassName?: string
}

/**
 * Next.js Image with blur placeholder, lazy loading, and fade-in on load.
 * Wrap in an aspect-ratio container to prevent layout shift.
 */
function OptimizedImage({
  src,
  alt,
  aspectClass = 'aspect-video',
  wrapperClassName,
  className,
  fill,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={cn('relative overflow-hidden bg-surface-elevated', aspectClass, wrapperClassName)}>
      <Image
        src={src}
        alt={alt}
        fill={fill ?? true}
        loading="lazy"
        className={cn(
          'object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setLoaded(true)}
        sizes={props.sizes ?? '(max-width: 768px) 100vw, 50vw'}
        {...props}
      />
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-linear-to-br from-surface-elevated to-surface"
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export { OptimizedImage }
export type { OptimizedImageProps }
