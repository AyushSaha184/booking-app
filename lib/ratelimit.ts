import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from './logger'

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

export const ratelimit = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: 'resort-booking',
})

export async function checkRateLimit(identifier: string): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const result = await ratelimit.limit(identifier)
  if (!result.success) {
    logger.warn('Rate limit exceeded for identifier', { identifier, remaining: result.remaining, reset: result.reset })
  }
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}