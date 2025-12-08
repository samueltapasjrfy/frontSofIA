// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ⚠️ IMPORTANTE: Middlewares no Next.js SEMPRE rodam no Edge Runtime
// O Edge Runtime NÃO suporta módulos do Node.js como 'crypto'
// 
// Se você PRECISA usar crypto do Node.js, você tem 2 opções:
// 1. Use Web Crypto API (já implementado abaixo - RECOMENDADO)
// 2. Mova a lógica para um Route Handler que pode usar Node.js Runtime
//
// Veja o arquivo middleware.example-nodejs.ts para exemplos de uso do crypto do Node.js

// Função para gerar nonce usando Web Crypto API (compatível com Edge Runtime)
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  // Converter Uint8Array para base64 usando apenas APIs do Edge Runtime
  const binary = String.fromCharCode.apply(null, Array.from(array))
  return btoa(binary)
}

export function middleware(request: NextRequest) {
  // Usando Web Crypto API (funciona no Edge Runtime)
  
  const response = NextResponse.next()
  return response
  const nonce = generateNonce()

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
