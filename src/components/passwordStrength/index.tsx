import * as React from "react"
import { cn } from "@/lib/utils"

export interface PasswordStrengthProps {
  password: string
  className?: string
}

type StrengthLevel = "empty" | "poor" | "average" | "strong"

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const [strength, setStrength] = React.useState<StrengthLevel>("empty")
  const [message, setMessage] = React.useState("")

  // Calcular a força da senha sempre que a senha mudar
  React.useEffect(() => {
    if (!password) {
      setStrength("empty")
      setMessage("")
      return
    }

    // Critérios para avaliar a força da senha
    const hasLowerCase = /[a-z]/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    const isLongEnough = password.length >= 8

    // Pontuação baseada nos critérios
    let score = 0
    if (hasLowerCase) score += 1
    if (hasUpperCase) score += 1
    if (hasNumbers) score += 1
    if (hasSpecialChars) score += 1
    if (isLongEnough) score += 1

    // Determinar o nível de força com base na pontuação
    let newStrength: StrengthLevel = "poor"
    let newMessage = "Sua senha é facilmente adivinhável. Você pode fazer melhor."

    if (score >= 4) {
      newStrength = "strong"
      newMessage = "Sua senha é ótima. Bom trabalho!"
    } else if (score >= 2) {
      newStrength = "average"
      newMessage = "Sua senha é facilmente adivinhável. Você pode fazer melhor."
    }

    setStrength(newStrength)
    setMessage(newMessage)
  }, [password])

  // Se não houver senha, não renderize nada
  if (strength === "empty") {
    return null
  }

  // Configurações de estilo baseadas na força
  const strengthConfigs = {
    poor: {
      labelColor: "text-red-500",
      barColor: "bg-red-500",
      barWidth: "w-1/3",
      emoji: "😥",
    },
    average: {
      labelColor: "text-yellow-500",
      barColor: "bg-yellow-500",
      barWidth: "w-2/3",
      emoji: "😐",
    },
    strong: {
      labelColor: "text-green-500",
      barColor: "bg-green-500",
      barWidth: "w-full",
      emoji: "😎",
    },
  }

  const config = strengthConfigs[strength]

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-700">Força da Senha</p>
        <p className={cn("text-sm font-medium", config.labelColor)}>
          {strength === "poor" 
            ? "Fraca" 
            : strength === "average" 
              ? "Média" 
              : "Forte"} {config.emoji}
        </p>
      </div>
      
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-300", config.barColor, config.barWidth)} 
        />
      </div>
      
      <p className="text-xs text-gray-500">{message}</p>
    </div>
  )
} 