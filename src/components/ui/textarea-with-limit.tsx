import React from 'react';
import { Textarea } from './textarea';

interface TextareaWithLimitProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
  label?: string;
  showRemainingChars?: boolean;
}

export function TextareaWithLimit({
  value,
  onChange,
  maxLength = 500,
  label,
  showRemainingChars = true,
  className,
  ...props
}: TextareaWithLimitProps) {
  // Função para lidar com a mudança do textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    
    // Verificar se ultrapassou o limite de caracteres
    if (value.length > maxLength) {
      return; // Não atualiza se ultrapassar o limite
    }
    
    // Chama o onChange passado por props
    onChange(e);
  };

  // Calcular caracteres restantes
  const remainingChars = maxLength - (value?.length || 0);
  
  // Determinar a cor do contador com base nos caracteres restantes
  const counterClass = remainingChars <= maxLength * 0.1
    ? 'text-red-500' 
    : remainingChars <= maxLength * 0.2
      ? 'text-yellow-500' 
      : 'text-gray-500';

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={props.id || 'textarea'} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <Textarea
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        className={className}
        {...props}
      />
      
      {showRemainingChars && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${counterClass}`}>
            {remainingChars} caracteres restantes
          </span>
        </div>
      )}
    </div>
  );
} 