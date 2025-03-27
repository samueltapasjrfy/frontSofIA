import React from 'react';
import Lottie from 'react-lottie';
import { useLottie } from '@/hooks/useLottie';
import { Skeleton } from './skeleton';

interface LottieAnimationProps {
  name: string;
  height?: number;
  width?: number;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  isStopped?: boolean;
  isPaused?: boolean;
}

/**
 * Componente reutilizável para exibir animações Lottie com cache
 */
export function LottieAnimation({
  name,
  height = 300,
  width = 300,
  className = '',
  loop = true,
  autoplay = true,
  isStopped = false,
  isPaused = false
}: LottieAnimationProps) {
  const { options, isLoading, error } = useLottie(name);

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-red-500 text-sm">Erro ao carregar animação</p>
      </div>
    );
  }

  if (isLoading || !options) {
    return <Skeleton className={`rounded-md ${className}`} style={{ width, height }} />;
  }

  // Substituir as opções de loop e autoplay se necessário
  const lottieOptions = {
    ...options,
    loop,
    autoplay
  };

  return (
    <Lottie
      options={lottieOptions}
      height={height}
      width={width}
      isStopped={isStopped}
      isPaused={isPaused}
      style={{ maxWidth: '100%' }}
    />
  );
} 