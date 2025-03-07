import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user, password } = body

    // Faz a requisição para a API de autenticação
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/App`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro na autenticação' },
        { status: response.status }
      )
    }

    // Define o cookie com o token
    const cookieStore = await cookies()
    cookieStore.set('auth-token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return NextResponse.json({ message: 'Login realizado com sucesso' })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 