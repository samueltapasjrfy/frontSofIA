import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

export interface InputIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  inputSize?: "small" | "medium" | "large"
  containerClassName?: string
  leftIconClassName?: string
  rightIconClassName?: string
  onLeftIconClick?: () => void
  onRightIconClick?: () => void
}

const InputIcon = React.forwardRef<HTMLInputElement, InputIconProps>(
  ({ 
    className, 
    leftIcon, 
    rightIcon, 
    inputSize = "medium", 
    containerClassName, 
    leftIconClassName,
    rightIconClassName,
    onLeftIconClick,
    onRightIconClick,
    ...props 
  }, ref) => {
    // Definir alturas e paddings baseados no tamanho
    const heights = {
      small: "h-7",
      medium: "h-9",
      large: "h-11"
    }
    
    const iconSizes = {
      small: "size-3",
      medium: "size-3.5",
      large: "size-4"
    }
    
    const iconPaddings = {
      small: leftIcon ? "pl-6" : "",
      medium: leftIcon ? "pl-8" : "",
      large: leftIcon ? "pl-10" : ""
    }

    // Calcular padding direito apenas se houver ícone à direita
    const rightPaddings = {
      small: rightIcon ? "pr-6" : "",
      medium: rightIcon ? "pr-8" : "",
      large: rightIcon ? "pr-10" : ""
    }

    return (
      <div className={cn("relative inline-flex w-full", containerClassName)}>
        {leftIcon && (
          <div 
            className={cn(
              "absolute left-0 inset-y-0 flex items-center",
              inputSize === "small" ? "pl-2" : inputSize === "large" ? "pl-3" : "pl-2.5",
              onLeftIconClick && "cursor-pointer",
              leftIconClassName
            )}
            onClick={onLeftIconClick}
          >
            {leftIcon}
          </div>
        )}
        
        <Input
          ref={ref}
          className={cn(
            heights[inputSize],
            iconPaddings[inputSize],
            rightPaddings[inputSize],
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div 
            className={cn(
              "absolute right-0 inset-y-0 flex items-center",
              inputSize === "small" ? "pr-2" : inputSize === "large" ? "pr-3" : "pr-2.5",
              onRightIconClick && "cursor-pointer",
              rightIconClassName
            )}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)

InputIcon.displayName = "InputIcon"

export { InputIcon } 