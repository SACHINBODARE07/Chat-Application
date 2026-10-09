import 'dotenv/config'
import { randomUUID, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { Pool } from 'pg'

const scrypt = promisify(scryptCb)

/* ---------- config ---------- */

const DEFAULTS = {
  name: 'Ava Morgan',
  email: 'admin@luma.com',
  password: 'admin12345', // 9 chars, meets the 8-char minimum
}

const [nameArg, emailArg, passwordArg] = process.argv.slice(2)

const name = nameArg ?? DEFAULTS.name
const email = (emailArg ?? DEFAULTS.email).trim().toLowerCase()
const password = passwordArg ?? DEFAULTS.password

if (password.length < 8) {
  console.error('Password must be at least 8 characters.')
  process.exit(1)
}

/* ---------- hashing (matches lib/auth.ts) ---------- */

async function hashPassword(plain: string) {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scrypt(plain, salt, 64)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

/* ---------- db ---------- */

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. Add it to .env.local first.')
  process.exit(1)
}

const pool = new Pool({ connectionString: url })

async function main() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const now = new Date()
    const passwordHash = await hashPassword(password)

    // 1. Upsert user
    const existing = await client.query<{ id: string }>(
      'SELECT id FROM "user" WHERE email = $1 LIMIT 1',
      [email],
    )

    let userId: string

    if (existing.rowCount === 0) {
      userId = randomUUID()
      await client.query(
        `INSERT INTO "user"
           (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, false, 'admin', $4, $4)`,
        [userId, name, email, now],
      )
      console.log(`· Created user ${email}`)
    } else {
      userId = existing.rows[0].id
      await client.query(
        `UPDATE "user"
            SET name = $1, role = 'admin', "updatedAt" = $2
          WHERE id = $3`,
        [name, now, userId],
      )
      console.log(`· User ${email} already existed — promoted to admin`)
    }

    // 2. Upsert credential account
    const accountRow = await client.query<{ id: string }>(
      `SELECT id FROM account
        WHERE "userId" = $1 AND "providerId" = 'credential'
        LIMIT 1`,
      [userId],
    )

    if (accountRow.rowCount === 0) {
      await client.query(
        `INSERT INTO account
           (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
         VALUES ($1, $2, 'credential', $3, $4, $5, $5)`,
        [randomUUID(), userId, userId, passwordHash, now],
      )
      console.log('· Created credential account')
    } else {
      await client.query(
        `UPDATE account
            SET password = $1, "updatedAt" = $2
          WHERE id = $3`,
        [passwordHash, now, accountRow.rows[0].id],
      )
      console.log('· Reset password on existing credential account')
    }

    await client.query('COMMIT')

    console.log('\n✅ Admin ready\n')
    console.log('   Email:    ' + email)
    console.log('   Password: ' + password)
    console.log('   Role:     admin')
    console.log('\nSign in at http://localhost:3000/login\n')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Failed:', err)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()