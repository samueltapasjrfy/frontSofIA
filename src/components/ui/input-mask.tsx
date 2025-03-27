import * as React from "react"
import { forwardRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

// Componente Input básico
const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export interface InputMaskProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: string;
  maskChar?: string;
  value?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputMask = forwardRef<HTMLInputElement, InputMaskProps>(
  ({ className, type = "text", mask, maskChar = "1", value = "", placeholder, onChange, ...props }, ref) => {
    // Estado para armazenar o valor formatado que aparece no input
    const [displayValue, setDisplayValue] = useState<string>("");

    // Função para gerar um placeholder padrão a partir da máscara
    const generatePlaceholder = (mask: string, maskChar: string): string => {
      return mask.split('').map(char => char === maskChar ? '_' : char).join('');
    };

    // Placeholder final: o fornecido pelo usuário ou o gerado automaticamente
    const finalPlaceholder = placeholder || generatePlaceholder(mask, maskChar);

    // Função para aplicar a máscara ao valor
    const applyMask = (value: string): string => {
      let result = "";
      let valueIndex = 0;

      // Percorre a máscara caractere por caractere
      for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
        // Se o caractere da máscara for igual ao maskChar, substitui pelo valor do input
        if (mask[i] === maskChar) {
          result += value[valueIndex];
          valueIndex++;
        } else {
          // Se for outro caractere (como ponto, traço, etc), mantém o caractere da máscara
          result += mask[i];
          
          // Se o próximo caractere do valor for igual ao caractere da máscara, avançamos o índice
          if (valueIndex < value.length && value[valueIndex] === mask[i]) {
            valueIndex++;
          }
        }
      }

      return result;
    };

    // Função para remover a máscara e obter apenas os valores digitados
    const removeMask = (maskedValue: string): string => {
      let result = "";
      let maskIndex = 0;

      // Percorre o valor formatado caractere por caractere
      for (let i = 0; i < maskedValue.length; i++) {
        // Se o caractere correspondente na máscara for igual ao maskChar, mantém o caractere do valor
        if (maskIndex < mask.length && mask[maskIndex] === maskChar) {
          result += maskedValue[i];
        }
        // Senão, verifica se o caractere é igual ao da máscara, o que indica um separador
        else if (maskIndex < mask.length && maskedValue[i] === mask[maskIndex]) {
          // Não adiciona ao resultado, pois é um separador da máscara
        } 
        // Caracteres que não correspondem à máscara são adicionados como estão
        else {
          result += maskedValue[i];
        }
        maskIndex++;
      }

      return result;
    };

    // Função para lidar com a mudança no input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Remove qualquer formatação anterior para obter apenas os caracteres digitados
      let cleanValue = removeMask(inputValue);
      
      // Limita os caracteres válidos baseado em regras específicas (como apenas números)
      if (type === "tel" || props.inputMode === "numeric") {
        cleanValue = cleanValue.replace(/\D/g, "");
      }
      
      // Limita o tamanho com base na máscara
      const maxLength = mask.split("").filter(char => char === maskChar).length;
      cleanValue = cleanValue.substring(0, maxLength);
      
      // Aplica a máscara novamente ao valor limpo
      const maskedValue = applyMask(cleanValue);
      setDisplayValue(maskedValue);
      
      // Notifica o componente pai com o valor sem a máscara
      if (onChange) {
        onChange(cleanValue, e);
      }
    };

    // Atualiza o displayValue quando a prop value mudar
    useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(applyMask(value));
      }
    }, [value, mask, maskChar]);

    return (
      <input
        type={type}
        data-slot="input"
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        placeholder={finalPlaceholder}
        className={cn(
          "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    );
  }
);

InputMask.displayName = "InputMask";

export { Input, InputMask };
