import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind conflict resolution.
 * Usage: cn('px-4 py-2', isActive && 'bg-accent', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Robustly normalize status strings handling spelling mistakes, abbreviations, and status variants.
 * e.g. "no", "n", "cancle", "cancled", "cancelled", "rejected" -> "cancelled"
 * e.g. "yes", "y", "confirm", "confrmed", "confirmed", "approved" -> "confirmed"
 */
export function normalizeStatusString(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const clean = raw.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!clean) return null

  // Confirmation variants
  if (
    /^(yes|y|1|true|ok|okay|confirm|confirmed|comfirm|comfirmed|confrmed|approve|approved|paid|done)$/.test(clean) ||
    clean.startsWith('confirm') ||
    clean.startsWith('comfirm') ||
    clean.startsWith('approv')
  ) {
    return 'confirmed'
  }

  // Cancellation variants
  if (
    /^(no|n|0|false|cancel|canceled|cancelled|cancle|canceld|cancled|cancele|reject|rejected|decline|declined|delete|deleted|void|off|close|closed|del)$/.test(clean) ||
    clean.startsWith('cancel') ||
    clean.startsWith('cancle') ||
    clean.startsWith('reject') ||
    clean.startsWith('declin')
  ) {
    return 'cancelled'
  }

  // Pending variants
  if (
    /^(pending|pend|pndg|wait|waiting|hold|holding)$/.test(clean) ||
    clean.startsWith('pend') ||
    clean.startsWith('wait')
  ) {
    return 'pending'
  }

  return null
}

/**
 * Parse room ID candidates from raw input string, handling missing commas (e.g. "124" -> ["124", "1", "2", "4"]),
 * spaces ("1 2 4"), slashes ("1/2/4"), or lists.
 */
export function parseRoomIdsString(rawInput: unknown): string[] {
  if (!rawInput) return []
  const inputStr = String(rawInput).trim()
  if (!inputStr) return []

  const tokens = inputStr.split(/[\s,/\\+]+/).map(t => t.trim()).filter(Boolean)
  const result: string[] = []

  for (const token of tokens) {
    if (token.includes('GMT') || token.includes('00:00:00') || token.length > 30) {
      continue
    }

    result.push(token)

    // If token is concatenated digits like "124", also generate single-digit candidates "1", "2", "4"
    if (/^\d{2,4}$/.test(token)) {
      for (const char of token) {
        result.push(char)
      }
    }
  }

  return [...new Set(result)]
}
