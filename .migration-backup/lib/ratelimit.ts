import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from './logger'

function createRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url) throw new Error('UPSTASH_REDIS_REST_URL is not configured')
  if (!token) throw new Error('UPSTASH_REDIS_REST_TOKEN is not configured')
  return new Redis({ url, token })
}

let _ratelimit: Ratelimit | null = null

function getRateLimiter(): Ratelimit {
  if (!_ratelimit) {
    const redis = createRedis()
    _ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: 'resort-booking',
    })
  }
  return _ratelimit
}

export async function checkRateLimit(identifier: string): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  const result = await getRateLimiter().limit(identifier)
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
