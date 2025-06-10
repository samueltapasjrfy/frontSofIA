export const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
        "DECISÃO JUDICIAL":
            "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
        "ORDEM COM PRAZO":
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
        "MERO EXPEDIENTE":
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
    }
    return colors[categoria] || "bg-gray-50 text-gray-700 border-gray-200"
}

export const getConfiancaColor = (confianca: { id: number, name: string } | null) => {
    if (!confianca)
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30"
    if (confianca.id === 3)
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
    if (confianca.id === 2)
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30"
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30"
}

export const getClassificacaoColor = (classificacao: string) => {
    const colors: Record<string, string> = {
        Audiência:
            "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30",
        Sentença:
            "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
        "Determinação de Pagamento":
            "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30",
    }
    return colors[classificacao] || "bg-gray-50 text-gray-700 border-gray-200"
}