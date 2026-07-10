import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not configured')
  const pool = new Pool({ connectionString: url })
  return drizzle(pool, { schema })
}

let _db: ReturnType<typeof getDb> | null = null
export function db() {
  if (!_db) {
    _db = getDb()
  }
  return _db
}
