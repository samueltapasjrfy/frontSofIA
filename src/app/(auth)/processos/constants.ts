export const importProcessColumns = {
    litigation: 'Processo',
    instance: 'Instância',
    idInternal: 'ID',
}

export const importProcessesExpectedColumns = [
    {
        key: importProcessColumns.litigation,
        example: '0001234-56.2024.8.26.0001',
        previewWidth: 200,
        variant: ['NÚMERO DO PROCESSO', 'PROCESSO', 'LITIGATION', 'NUMBER'],
    },
    {
        key: importProcessColumns.instance,
        example: '1',
        previewWidth: 200,
        variant: ['INSTÂNCIA', 'INSTANCE', 'INSTANCE NUMBER'],
    },
    {
        key: importProcessColumns.idInternal,
        example: '1234567890',
        previewWidth: 200,
        variant: ['ID INTERNO', 'ID DA PUBLICAÇÃO'],
    }
]