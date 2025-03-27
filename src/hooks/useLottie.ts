import { useState, useEffect } from 'react';
import { getLottieAnimation, useLottieOptions } from '@/utils/lottieCache';

/**
 * Hook que carrega uma animação Lottie e gerencia o estado de carregamento
 * @param path Nome do arquivo Lottie (sem .json)
 * @returns Um objeto com a animação, opções de configuração e estado de carregamento
 */
export function useLottie(path: string) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadAnimation() {
      try {
        setIsLoading(true);
        const data = await getLottieAnimation(path);
        
        if (isMounted) {
          setAnimationData(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    }

    loadAnimation();

    return () => {
      isMounted = false;
    };
  }, [path]);

  // Gera as opções para o componente Lottie com base nos dados carregados
  const options = useLottieOptions(animationData);

  return {
    animationData,
    options,
    isLoading,
    error
  };
} 