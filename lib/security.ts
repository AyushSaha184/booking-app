import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export function addSecurityHeaders(request: Request): Response {
  const response = new NextResponse(null, { status: 200 })
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export function securityHeaders(request: Request): HeadersInit {
  const headers: Record<string, string> = {}
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    headers[key] = value
  })
  return headers
}

export function withSecurityHeaders(response: Response, request: Request): Response {
  const newResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      ...SECURITY_HEADERS,
    },
  })
  return newResponse
}