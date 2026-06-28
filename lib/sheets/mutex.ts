import { Redis } from '@upstash/redis'
import { logger } from '../logger'

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url) throw new Error('UPSTASH_REDIS_REST_URL is not configured')
  if (!token) throw new Error('UPSTASH_REDIS_REST_TOKEN is not configured')
  return new Redis({ url, token })
}

let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) {
    _redis = createRedis()
  }
  return _redis
}

const SHEETS_LOCK_KEY = 'resort:google-sheets:lock'
const SHEETS_LOCK_TTL = 10

export async function acquireSheetsLock(bookingId: string, ttlSeconds: number = SHEETS_LOCK_TTL): Promise<boolean> {
  const lockValue = `${bookingId}:${Date.now()}`
  const result = await getRedis().set(SHEETS_LOCK_KEY, lockValue, { nx: true, ex: ttlSeconds })
  return result === 'OK'
}

export async function releaseSheetsLock(bookingId: string): Promise<void> {
  await getRedis().del(SHEETS_LOCK_KEY)
}

export async function withSheetsLock<T>(
  bookingId: string,
  operation: () => Promise<T>,
  maxWaitMs: number = 5000
): Promise<T> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitMs) {
    const acquired = await acquireSheetsLock(bookingId)
    if (acquired) {
      logger.debug('Acquired Sheets mutex lock', { bookingId })
      try {
        return await operation()
      } finally {
        await releaseSheetsLock(bookingId)
        logger.debug('Released Sheets mutex lock', { bookingId })
      }
    }

    await new Promise(resolve => setTimeout(resolve, 100))
  }

  await new Promise(resolve => setTimeout(resolve, 1000))
  const acquired = await acquireSheetsLock(bookingId, 30)
  if (acquired) {
    try {
      return await operation()
    } finally {
      await releaseSheetsLock(bookingId)
    }
  }

  throw new Error('Google Sheets temporarily unavailable. Booking created but sync pending.')
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 500
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const errorMessage = lastError.message?.toLowerCase() ?? ''

      const isRetryable =
        errorMessage.includes('rate limit') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('service unavailable') ||
        errorMessage.includes('429') ||
        errorMessage.includes('500') ||
        errorMessage.includes('503') ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout')

      if (!isRetryable || attempt === maxRetries - 1) {
        logger.warn('Non-retryable Sheets operation error', { attempt, error: lastError.message })
        throw lastError
      }

      const delay = baseDelayMs * Math.pow(2, attempt)
      logger.info('Retrying Sheets operation after error', { attempt, delay, error: lastError.message })
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}