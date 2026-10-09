import 'dotenv/config'

const raw = process.env.DATABASE_URL_3 ?? process.env.DATABASE_URL

if (!raw) {
  console.log('(unset) — neither DATABASE_URL_3 nor DATABASE_URL is defined')
  process.exit(0)
}

try {
  const url = new URL(raw)
  console.log({
    source: process.env.DATABASE_URL_3 ? 'DATABASE_URL_3' : 'DATABASE_URL',
    protocol: url.protocol,
    host: url.hostname,
    port: url.port || '(default)',
    database: url.pathname.replace(/^\//, ''),
    user: url.username,
    passwordLength: url.password.length,
  })
} catch (error) {
  console.log('URL is not parseable:', raw.slice(0, 40) + '…')
  console.log(error)
}