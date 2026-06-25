'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

/** Base shimmer skeleton block */
function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface-elevated/80',
        className
      )}
      style={style}
      aria-hidden="true"
    />
  )
}

/** Full card skeleton matching BookingFormCard shape */
function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-xl overflow-hidden',
        className
      )}
      aria-hidden="true"
    >
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
        <Skeleton className="h-12" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
    </div>
  )
}

/** Single line text skeleton */
function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-3/4 rounded', className)} />
}

/** Chat message bubble skeleton */
function SkeletonMessage({ isUser = false }: { isUser?: boolean }) {
  return (
    <div
      className={cn(
        'flex gap-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
      aria-hidden="true"
    >
      <Skeleton
        className={cn(
          'h-10 rounded-2xl',
          isUser ? 'w-48' : 'w-64'
        )}
      />
    </div>
  )
}

/** Circular avatar skeleton */
function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      className="rounded-full"
      style={{ width: size, height: size } as React.CSSProperties}
    />
  )
}

export { Skeleton, SkeletonCard, SkeletonText, SkeletonMessage, SkeletonAvatar }
