import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'luma-support-api',
    timestamp: new Date().toISOString(),
  })
}
