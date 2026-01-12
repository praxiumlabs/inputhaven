import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.error('Redis connection failed after 3 retries')
      return null
    }
    return Math.min(times * 200, 1000)
  },
  lazyConnect: true
})

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (err: Error) => {
  console.error('Redis error:', err.message)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.quit()
})
