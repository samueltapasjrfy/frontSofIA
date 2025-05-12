import { AsyncPaginate } from "react-select-async-paginate";

type SelectInfinityScrollProps = {
    instanceId: string;
    placeholder: string;
    loadOptions: (params: { search: string, options: any, additional: any }) => Promise<any>;
    onChange: (value: any) => void;
    value: { label: string; value: string }[];
    isLoading?: boolean;
    isSearchable?: boolean;
    multiple?: boolean;
}

export const SelectInfinityScroll = ({
    instanceId,
    placeholder,
    loadOptions,
    onChange,
    value,
    isLoading,
    isSearchable,
    multiple
}: SelectInfinityScrollProps) => {

    return (
        <AsyncPaginate
            instanceId={instanceId}
            placeholder={placeholder}
            debounceTimeout={1000}
            styles={{
                placeholder: (base) => ({
                    ...base,
                    color: '#000',
                    fontSize: '15px'
                }),
                indicatorSeparator: (base) => ({
                    ...base,
                    display: 'none'
                }),
                dropdownIndicator: (base) => ({
                    ...base,
                    color: '#000',
                }),
                control: (base) => ({
                    ...base,
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    paddingLeft: '10px',
                }),
            }}
            value={value}
            loadOptions={(search, options, additional) => loadOptions({ search, options, additional })}
            onChange={onChange}
            isLoading={isLoading}
            isSearchable={isSearchable}
            isMulti={multiple}
            noOptionsMessage={() => 'Nenhum resultado encontrado'}
            loadingMessage={() => 'Carregando...'}
        />
    )
}