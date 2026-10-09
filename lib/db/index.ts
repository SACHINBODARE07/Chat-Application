import 'server-only'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Add it to .env.local and restart the dev server.')
}
if (!/^postgres(ql)?:\/\//.test(databaseUrl)) {
  throw new Error(
    `DATABASE_URL is not a valid Postgres URL. Got: ${databaseUrl.slice(0, 40)}…`,
  )
}

export const pool = new Pool({ connectionString: databaseUrl })
export const db = drizzle(pool, { schema })
export { schema }