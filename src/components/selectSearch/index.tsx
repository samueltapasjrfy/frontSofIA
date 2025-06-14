import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import Select from 'react-select';

type Option = { value: string, label: string }

interface SelectSearchProps {
    options: { value: string; label: string }[];
    value?: Option[];
    onChange: (value: Option[]) => void;
    multiple?: boolean;
    placeholder?: string;
    className?: string;
    label?: string;
    id?: string;
    key?: string;
}


export default function SelectSearch({
    options,
    value,
    onChange,
    multiple: isMulti,
    className,
    placeholder = "Selecione uma opção",
    label,
    id,
    key,
}: SelectSearchProps) {

    useEffect(() => {
        console.log("value", value)
    }, [value])

    return (
        <div className="relative">
            {label && <label htmlFor={id} className="text-sm">{label}</label>}
            <Select<Option, true>
                id={id}
                components={{
                    Control: (props) => (
                        <div className="">
                            <div {...props.innerProps} className={cn(
                                "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent pt-[2px] text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                                "hover:border-gray-300",
                                className
                            )}>
                                {props.children}
                            </div>
                        </div>
                    ),
                    Menu: (props) => (
                        <div className="relative">
                            <div {...props.innerProps} className={`absolute border-1 bg-white border-gray-300 w-full`}>{props.children}</div>
                        </div>
                    ),
                    Option: (props) => (
                        <div className="flex items-center justify-between hover:bg-[#DEEBFF] cursor-pointer" {...props.innerProps}>
                            <div className="flex items-center gap-2 p-2">
                                <span className="text-sm">{props.data.label}</span>
                            </div>
                        </div>
                    ),
                    IndicatorSeparator: () => (
                        <div />
                    ),
                    NoOptionsMessage: () => (
                        <div className="text-center">
                            <span className="text-sm text-gray-500">Nenhuma opção encontrada</span>
                        </div>
                    )
                }}
                styles={{
                    multiValue: (base) => ({
                        ...base,
                        backgroundColor: 'oklch(0.97 0.014 254.604)',
                    }),
                    multiValueRemove: (base) => ({
                        ...base,
                        cursor: 'pointer',
                        ":hover": {
                            backgroundColor: 'oklch(0.97 0.074 254.604)',
                        }
                    }),
                }}
                key={key}
                placeholder={placeholder}
                value={value}
                onChange={(option) => {
                    console.log("option", option)
                    if (!option) return onChange([])
                    if (isMulti) {
                        onChange(option as unknown as Option[])
                    } else {
                        onChange([{ value: option[0].value, label: option[0].label } as Option])
                    }
                }}
                options={options}
                isMulti={isMulti || true} /* ? Funcionou */
            />
        </div>
    )
}