'use client'

import { useRef, useEffect } from 'react'

export default function ChatInput({
  input,
  onChange,
  onSubmit,
  onKeyDown,
  isLoading,
  textareaRef,
}: {
  input: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  isLoading: boolean
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}) {
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const ref = textareaRef || internalRef

  return (
    <div style={{
      padding: '12px 16px',
      paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '8px 8px 8px 14px',
      }}>
        <textarea
          ref={ref}
          value={input}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Message..."
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            color: 'var(--text-primary)',
            fontSize: '16px',
            lineHeight: '1.5',
            fontFamily: 'inherit',
            padding: '4px 0',
            maxHeight: '120px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            WebkitAppearance: 'none',
          }}
        />
        <button
          onClick={(e) => { if (input.trim() && !isLoading) onSubmit(e as any) }}
          disabled={!input.trim() || isLoading}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--bg-elevated)',
            border: 'none',
            cursor: input.trim() && !isLoading ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
            minWidth: '44px',
            minHeight: '44px',
          }}
          aria-label="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 13V3M3 8l5-5 5 5" stroke={input.trim() && !isLoading ? '#0f0f0f' : '#5a5755'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}