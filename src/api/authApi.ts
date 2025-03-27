export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string
  }
  status: {
    id: number;
    status: string;
  };
  companies: {
    id: string;
    name: string;
  }[];
}

export type RegisterResponse = {
  id: string;
  name: string;
  email: string;
  token: string;
};
// Função para solicitar verificação de usuário
export async function registerUser(email: string, password: string, name: string): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/Register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao registrar usuário')
    }

    return data.data
  } catch (error) {
    console.error('Erro ao registrar usuário:', error)
    throw error
  }
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/App`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login')
    }

    return data.data
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    throw error
  }
}

export async function loginGoogle(token: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/Google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login com Google')
    }

    return data.data
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error)
    throw error
  }
}

// Função para solicitar verificação de usuário
export async function requestVerification(token: string): Promise<{ message: string, milliseconds?: number, isValid: boolean }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/Verification?send=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // Não envia body
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        message: data.message || 'Erro ao solicitar verificação',
        milliseconds: data.milliseconds,
        isValid: false
      }
    }

    return data
  } catch (error) {
    console.error('Erro ao solicitar verificação:', error)
    throw error
  }
}

// Função para confirmar a verificação com o código recebido
export async function confirmVerification(token: string, code: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/Verification/Confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao confirmar verificação')
    }

    return data
  } catch (error) {
    console.error('Erro ao confirmar verificação:', error)
    throw error
  }
}

// Função para solicitar redefinição de senha
export async function requestPasswordReset(email: string): Promise<{ message: string, isValid: boolean, milliseconds?: number }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/ResetPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    })

    const data = await response.json()
    if (!response.ok) {
      return {
        message: data.message || 'Erro ao solicitar redefinição de senha',
        milliseconds: data.milliseconds,
        isValid: false
      }
    }

    return {
      message: data.message || 'Código de redefinição enviado com sucesso',
      isValid: true,
      milliseconds: data.milliseconds
    }
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error)
    throw error
  }
}

// Função para verificar o código de redefinição de senha
export async function verifyPasswordResetCode(email: string, code: string): Promise<{ message: string, isValid: boolean }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/ResetPassword/Verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Código de verificação inválido')
    }

    return {
      message: 'Código verificado com sucesso',
      isValid: true
    }
  } catch (error) {
    console.error('Erro ao verificar código de redefinição:', error)
    throw error
  }
}

// Função para redefinir a senha
export async function resetPassword(email: string, code: string, password: string): Promise<{ message: string, isValid: boolean }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Auth/ResetPassword/Confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao redefinir senha')
    }

    return {
      message: data.message || 'Senha redefinida com sucesso',
      isValid: true
    }
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    throw error
  }
} 