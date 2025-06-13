import { PublicationV2Api } from "@/api/publicationV2Api"
import { SelectInfinityScroll } from "@/components/selectInfinityScroll"
import SelectSearch from "@/components/selectSearch"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PUBLICATION_STATUS_LABEL, PUBLICATION_STATUS } from "@/constants/publicationsV2"
import { Search } from "lucide-react"
import { useRef, useState } from "react"

interface FilterComponentProps {
    onFilterChange: (params: Partial<PublicationV2Api.FindAll.Params>) => void
    onResetFilters: () => void
}

const defaultFilter: Partial<PublicationV2Api.FindAll.Params> = {
    search: "",
    status: [],
    caseType: [],
    classification: [],
    recipient: []
}

type Option = {
    label: string
    value: string
}

export const FilterComponent = ({ onFilterChange, onResetFilters }: FilterComponentProps) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<Partial<PublicationV2Api.FindAll.Params>>(defaultFilter)
    const [isLoadingComponents, setIsLoadingComponents] = useState({
        caseType: false,
        classification: false,
        recipient: false,
        category: false
    })
    const [caseTypes, setCaseTypes] = useState<Option[]>([])
    const [classifications, setClassifications] = useState<Option[]>([])
    const [recipients, setRecipients] = useState<Option[]>([])
    const [categories, setCategories] = useState<Option[]>([])

    const handleResetFilters = () => {
        onResetFilters()
        setSearchTerm("")
        setFilter(defaultFilter)
    }

    const handleFilterChange = (key: keyof PublicationV2Api.FindAll.Params, value: string[]) => {
        console.log("handleFilterChange", key, value)
        setFilter({ ...filter, [key]: value })
        onFilterChange({ ...filter, [key]: value })
    }

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }
        debounceTimeout.current = setTimeout(() => {
            console.log("search", e.target.value)
            onFilterChange({ search: e.target.value })
        }, 1000)
    }

    const handleLoad = async (
        api: (params: any) => Promise<any>,
        search: string,
        additional: any,
        adapter: (item: any) => Option,
        responseKey: string,
        setIsLoading: (isLoading: boolean) => void
    ) => {
        try {
            setIsLoading(true)
            additional = additional || {
                lastId: 0,
                limit: 10,
            }
            const response = await api({
                lastId: additional.lastId,
                limit: additional.limit,
                search: search
            })
            return {
                options: response[responseKey].map(adapter),
                hasMore: response.hasMore,
                additional: {
                    lastId: response.lastId ? +response.lastId : 0,
                    limit: additional.limit,
                    search: additional.search
                }
            };
        } catch (error) {
            console.error(error)
            return {
                options: [],
                hasMore: false,
                additional: {
                    lastId: 0,
                    limit: additional.limit,
                    search: additional.search
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleLoadCategory = async ({ additional, search }: any) => {
        return await handleLoad(
            PublicationV2Api.findCategories,
            search,
            additional,
            (item: PublicationV2Api.FindCategories.Category) => ({
                label: item.category,
                value: item.id.toString()
            }),
            "categories",
            (isLoading: boolean) => setIsLoadingComponents({ ...isLoadingComponents, category: isLoading })
        )
    }

    const handleLoadCaseType = async ({ additional, search }: any) => {
        return await handleLoad(
            PublicationV2Api.findCaseTypes,
            search,
            additional,
            (item: PublicationV2Api.FindCaseTypes.CaseType) => ({
                label: item.name,
                value: item.id.toString()
            }),
            "caseTypes",
            (isLoading: boolean) => setIsLoadingComponents({ ...isLoadingComponents, caseType: isLoading })
        )
    }

    const handleLoadClassification = async ({ additional, search }: any) => {
        return await handleLoad(
            PublicationV2Api.findClassifications,
            search,
            additional,
            (item: PublicationV2Api.FindClassifications.Classification) => ({
                label: item.classification,
                value: item.id.toString()
            }),
            "classifications",
            (isLoading: boolean) => setIsLoadingComponents({ ...isLoadingComponents, classification: isLoading })
        )
    }

    const handleLoadRecipient = async ({ additional, search }: any) => {
        return await handleLoad(
            PublicationV2Api.findRecipients,
            search,
            additional,
            (item: PublicationV2Api.FindRecipients.Recipient) => ({
                label: `${item.recipient} - ${item.polo.name}`,
                value: item.id.toString()
            }),
            "recipients",
            (isLoading: boolean) => setIsLoadingComponents({ ...isLoadingComponents, recipient: isLoading })
        )
    }

    return (
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm" >
            <CardContent>
                <div className="flex gap-2">
                    <div className="w-full md:w-1/2 lg:w-4/12 xl:w-3/12">
                        <label htmlFor="search" className="text-sm block mb-1">Buscar</label>
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="search"
                                    placeholder="Buscar processo, parte..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="pl-10 bg-transparent border-gray-200 dark:border-gray-700 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 lg:w-2/12 xl:w-2/12">
                        <SelectSearch
                            id="status"
                            multiple
                            label="Status"
                            className="w-full"
                            options={
                                Object.keys(PUBLICATION_STATUS).map((status) => (
                                    {
                                        value: PUBLICATION_STATUS[status as keyof typeof PUBLICATION_STATUS].toString(),
                                        label: PUBLICATION_STATUS_LABEL[status as keyof typeof PUBLICATION_STATUS_LABEL]
                                    }
                                ))
                            }
                            onChange={(values) => handleFilterChange("status", values.map(({ value }) => value))}
                        />
                    </div>
                    <div className="w-full md:w-1/2 lg:w-2/12 xl:w-2/12">
                        <SelectInfinityScroll
                            label="Tipo"
                            instanceId="caseType"
                            placeholder="Selecione"
                            isSearchable
                            multiple
                            className="w-full"
                            loadOptions={handleLoadCaseType}
                            onChange={(value) => {
                                handleFilterChange("caseType", value.map(({ value }: { value: string }) => +value))
                                setCaseTypes(value)
                            }}
                            value={caseTypes}
                            additional={{
                                lastId: 0,
                                limit: 10,
                                search: ""
                            }}
                            isLoading={isLoadingComponents.caseType}
                        />
                    </div>
                    <div className="w-full md:w-1/2 lg:w-2/12 xl:w-2/12">
                        <SelectInfinityScroll
                            label="Classificação"
                            instanceId="classification"
                            placeholder="Selecione"
                            isSearchable
                            multiple
                            className="w-full"
                            loadOptions={handleLoadClassification}
                            onChange={(value) => {
                                handleFilterChange("classification", value.map(({ value }: { value: string }) => +value))
                                setClassifications(value)
                            }}
                            value={classifications}
                            additional={{
                                lastId: 0,
                                limit: 10,
                                search: ""
                            }}
                            isLoading={isLoadingComponents.classification}
                        />
                    </div>
                    <div className="w-full md:w-1/2 lg:w-2/12 xl:w-2/12">
                        <SelectInfinityScroll
                            label="Remetente"
                            instanceId="recipient"
                            placeholder="Selecione"
                            isSearchable
                            className="w-full"
                            loadOptions={handleLoadRecipient}
                            multiple
                            onChange={(value) => {
                                handleFilterChange("recipient", value.map(({ value }: { value: string }) => +value))
                                setRecipients(value)
                            }}
                            value={recipients}
                            additional={{
                                lastId: 0,
                                limit: 10,
                                search: ""
                            }}
                            isLoading={isLoadingComponents.recipient}
                        />
                    </div>
                    <div className="w-full md:w-1/2 lg:w-2/12 xl:w-2/12">
                        <SelectInfinityScroll
                            label="Categoria"
                            instanceId="category"
                            placeholder="Selecione"
                            isSearchable
                            multiple
                            className="w-full"
                            loadOptions={handleLoadCategory}
                            onChange={(value) => {
                                handleFilterChange("category", value.map(({ value }: { value: string }) => +value))
                                setCategories(value)
                            }}
                            value={categories}
                            additional={{
                                lastId: 0,
                                limit: 10,
                                search: ""
                            }}
                            isLoading={isLoadingComponents.category}
                        />
                    </div>
                    {/*

                    .concat(Object.keys(PUBLICATION_STATUS).map((status, index) => (
                                {
                                    value: PUBLICATION_STATUS[status as keyof typeof PUBLICATION_STATUS].toString(),
                                    label: PUBLICATION_STATUS_LABEL[status as keyof typeof PUBLICATION_STATUS_LABEL]
                                }
                            )))

                    <Select value={filter.caseType?.toString()} onValueChange={(value) => handleFilterChange("caseType", value)}>
                        <SelectTrigger className="w-48 border-gray-200 dark:border-gray-700 focus:ring-gray-400 dark:focus:ring-gray-500">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Todas as categorias</SelectItem>
                            <SelectItem value="DECISÃO JUDICIAL">Decisão Judicial</SelectItem>
                            <SelectItem value="ORDEM COM PRAZO">Ordem com Prazo</SelectItem>
                            <SelectItem value="MERO EXPEDIENTE">Mero Expediente</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filter.classification?.toString() || "all"} onValueChange={(value) => handleFilterChange("classification", value)}>
                        <SelectTrigger className="w-48 border-gray-200 dark:border-gray-700 focus:ring-gray-400 dark:focus:ring-gray-500">
                            <SelectValue placeholder="Classificação" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as classificações</SelectItem>
                            <SelectItem value="Audiência">Audiência</SelectItem>
                            <SelectItem value="Sentença">Sentença</SelectItem>
                            <SelectItem value="Determinação de Pagamento">Determinação de Pagamento</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filter.sender?.toString() || "all"} onValueChange={(value) => handleFilterChange("sender", value)}>
                        <SelectTrigger className="w-48 border-gray-200 dark:border-gray-700 focus:ring-gray-400 dark:focus:ring-gray-500">
                            <SelectValue placeholder="Remetente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os remetentes</SelectItem>
                            <SelectItem value="Autor">Autor</SelectItem>
                            <SelectItem value="Réu">Réu</SelectItem>
                            <SelectItem value="Exequente">Exequente</SelectItem>
                            <SelectItem value="Executado">Executado</SelectItem>
                            <SelectItem value="Ambos">Ambos</SelectItem>
                        </SelectContent>
                    </Select>
                    */}

                </div>
            </CardContent>
        </Card >
    )
}