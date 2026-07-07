'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

interface DatePickerProps {
  value: string                 // YYYY-MM-DD
  onChange: (val: string) => void
  min?: string                  // YYYY-MM-DD
  placeholder?: string
  className?: string
  id?: string
}

function toYMD(d: Date): string {
  return d.toISOString().split('T')[0]
}

function parseYMD(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const d = new Date(s + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}

function formatDisplay(ymd: string): string {
  const d = parseYMD(ymd)
  if (!d) return ''
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function DatePicker({ value, onChange, min, placeholder = 'dd/mm/yyyy', className, id }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Which month to show in the calendar grid
  const selectedDate = parseYMD(value)
  const [viewYear, setViewYear] = useState(() => selectedDate?.getFullYear() ?? new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => selectedDate?.getMonth() ?? new Date().getMonth())

  // Sync view when value changes externally
  useEffect(() => {
    const d = parseYMD(value)
    if (d) {
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  // Click-outside handler
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  /* ── Navigation ─────────────────────────────────── */
  const goPrev = useCallback(() => {
    setViewMonth(m => {
      if (m === 0) { setViewYear(y => y - 1); return 11 }
      return m - 1
    })
  }, [])

  const goNext = useCallback(() => {
    setViewMonth(m => {
      if (m === 11) { setViewYear(y => y + 1); return 0 }
      return m + 1
    })
  }, [])

  /* ── Build calendar grid ────────────────────────── */
  const todayStr = toYMD(new Date())
  const minDate = min ? parseYMD(min) : null

  const firstDay = new Date(viewYear, viewMonth, 1)
  const startDow = firstDay.getDay()             // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // Previous month overflow cells
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
  const cells: { day: number; inMonth: boolean; dateStr: string }[] = []

  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const dt = new Date(viewYear, viewMonth - 1, d)
    cells.push({ day: d, inMonth: false, dateStr: toYMD(dt) })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(viewYear, viewMonth, d)
    cells.push({ day: d, inMonth: true, dateStr: toYMD(dt) })
  }
  // Fill remaining to complete row of 7
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const dt = new Date(viewYear, viewMonth + 1, d)
      cells.push({ day: d, inMonth: false, dateStr: toYMD(dt) })
    }
  }

  // Can we go to the previous month?
  const canGoPrev = (() => {
    if (!minDate) return true
    const prevEnd = new Date(viewYear, viewMonth, 0)
    return prevEnd >= minDate
  })()

  return (
    <div ref={containerRef} className={cn('relative', className)} id={id}>
      {/* ── Trigger ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center bg-[#FAFAF9] border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 focus-within:bg-white focus-within:border-[#7C1A36] focus-within:ring-4 focus-within:ring-[#7C1A36]/5 cursor-pointer"
      >
        <span className="w-10 h-10 flex items-center justify-center border-r border-gray-200 shrink-0 text-[#7C1A36]">
          <Calendar className="w-4 h-4" />
        </span>
        <span className={cn(
          'flex-1 h-10 px-3 flex items-center text-[13px] text-left',
          value ? 'text-gray-900' : 'text-[#C37A8C]/50'
        )}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {/* ── Calendar dropdown ──────────────────────── */}
      {open && (
        <div className="absolute z-50 mt-1.5 left-0 right-0 sm:left-auto sm:right-auto sm:w-[280px] bg-white border border-gray-200 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in-0 slide-in-from-top-1 duration-150">
          {/* Month/Year header */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#7C1A36] to-[#A12444]">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:bg-white/15 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-white tracking-wide">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:bg-white/15 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 px-2 pt-2 pb-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 px-2 pb-2.5 gap-y-0.5">
            {cells.map((cell, i) => {
              const isToday = cell.dateStr === todayStr
              const isSelected = cell.dateStr === value
              const isDisabled = !cell.inMonth || (minDate ? new Date(cell.dateStr) < minDate : false)

              return (
                <button
                  key={i}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(cell.dateStr)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer',
                    isDisabled && 'text-gray-300 cursor-default pointer-events-none',
                    !isDisabled && !isSelected && 'hover:bg-[#7C1A36]/5 hover:text-[#7C1A36]',
                    isToday && !isSelected && cell.inMonth && 'font-bold text-[#7C1A36] ring-1 ring-[#7C1A36]/20',
                    isSelected && 'bg-[#7C1A36] text-white font-bold shadow-sm',
                    !cell.inMonth && !isDisabled && 'text-gray-300',
                  )}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          {/* Footer — Today shortcut */}
          <div className="border-t border-gray-100 px-3 py-2 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                const t = new Date()
                setViewYear(t.getFullYear())
                setViewMonth(t.getMonth())
              }}
              className="text-[11px] font-semibold text-[#7C1A36] hover:underline cursor-pointer"
            >
              Today
            </button>
            {value && (
              <span className="text-[10px] text-gray-400 font-medium">
                {formatDisplay(value)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
