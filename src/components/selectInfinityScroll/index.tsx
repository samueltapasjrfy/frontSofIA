import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { InputActionMeta } from "react-select";
import { AsyncPaginate } from "react-select-async-paginate";

type LoadOptionsParams = {
    search: string;
    options: any;
    additional: any;
}

type LoadOptionsResponse = {
    options: { label: string, value: string }[];
    hasMore: boolean;
    additional: {
        lastId: number;
        limit: number;
        search: string;
    }
}

type SelectInfinityScrollProps = {
    instanceId: string;
    placeholder: string;
    loadOptions: (params: LoadOptionsParams) => Promise<LoadOptionsResponse>;
    onChange: (value: any) => void;
    value: { label: string; value: string }[];
    isLoading?: boolean;
    isSearchable?: boolean;
    multiple?: boolean;
    isClearable?: boolean;
    label?: string;
    className?: string;
    additional?: Record<string, any>;
    debounceTimeout?: number;
}

export const SelectInfinityScroll = ({
    instanceId,
    placeholder,
    loadOptions,
    onChange,
    value,
    isLoading,
    isSearchable,
    multiple,
    isClearable = true,
    label,
    className,
    additional,
    debounceTimeout = 1000
}: SelectInfinityScrollProps) => {
    const [isDebouncing, setIsDebouncing] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleInputChange = (inputValue: string, actionMeta: InputActionMeta) => {
        setIsDebouncing(true)

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            setIsDebouncing(false)
        }, debounceTimeout)
    }

    return (
        <div>
            {label && <label htmlFor={instanceId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <AsyncPaginate
                instanceId={instanceId}
                placeholder={placeholder}
                debounceTimeout={debounceTimeout}
                isClearable={isClearable}
                className={className}
                styles={{
                    placeholder: (base) => ({
                        ...base,
                        color: 'rgba(0, 0, 0, 0.5)',
                        fontSize: '15px'
                    }),
                    indicatorSeparator: (base) => ({
                        ...base,
                        display: 'none'
                    }),
                    dropdownIndicator: (base) => ({
                        ...base,
                        color: "rgba(0, 0, 0, 0.5)",
                    }),
                    control: (base) => ({
                        ...base,
                        borderColor: '#e2e8f0',
                        borderRadius: '0.5rem',
                        paddingLeft: '10px',
                    }),
                    option: (base) => ({
                        ...base,
                        fontSize: '14px',
                    }),
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
                value={value}
                loadOptions={(search, options, additional) => loadOptions({ search, options, additional })}
                onChange={onChange}
                onInputChange={handleInputChange}
                isLoading={isLoading || isDebouncing}
                isSearchable={isSearchable}
                isMulti={multiple}
                additional={additional}
                noOptionsMessage={({ }) => 'Nenhum resultado encontrado'}
                loadingMessage={() => 'Carregando...'}
            />
        </div>
    )
}