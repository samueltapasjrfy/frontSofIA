// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

export function middleware(request: NextRequest) {
  const nonce = crypto.randomBytes(16).toString('base64')

  const response = NextResponse.next()

  // 👇 Aqui definimos a CSP segura com o nonce dinâmico
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' https://accounts.google.com https://apis.google.com https://www.gstatic.com;
      style-src 'self' 'unsafe-inline';
      connect-src 'self' https://accounts.google.com https://www.googleapis.com;
      img-src 'self' data: https:;
      frame-src https://accounts.google.com;
    `.replace(/\s{2,}/g, ' ').trim()
  )

  // 👇 Esse header interno você usa pra recuperar o nonce em SSR
  response.headers.set('x-nonce', nonce)

  return response
}

// 🔁 Esse config diz onde o middleware será aplicado (exclui arquivos estáticos)
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'], // exclui _next e arquivos estáticos como .js, .css, .ico etc
}
