// Módulo para cachear animações Lottie

// Objeto que armazenará as animações carregadas
const lottieCache: Record<string, any> = {};

/**
 * Função que carrega e cacheia uma animação Lottie
 * @param path Caminho relativo da animação (sem a extensão)
 * @returns A animação carregada
 */
export async function getLottieAnimation(path: string): Promise<any> {
  // Verificar se a animação já está em cache
  if (lottieCache[path]) {
    return lottieCache[path];
  }

  try {
    // Carregar a animação dinamicamente
    const animation = await import(`@/assets/lotties/${path}.json`);
    
    // Armazenar no cache
    lottieCache[path] = animation;
    
    return animation;
  } catch (error) {
    console.error(`Erro ao carregar animação Lottie: ${path}`, error);
    throw error;
  }
}

/**
 * Função síncrona que retorna uma animação Lottie pré-carregada
 * @param animationData Dados da animação já importados
 * @returns Objeto com a animação e suas opções padrão
 */
export function useLottieOptions(animationData: any) {
  return {
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
}

/**
 * Hook para pré-carregar múltiplas animações de uma vez
 * @param paths Array de caminhos de animações a serem carregadas
 */
export async function preloadLottieAnimations(paths: string[]): Promise<void> {
  await Promise.all(paths.map(path => getLottieAnimation(path)));
} 