export const litigationColumns = {
    litigation: 'Processo',
    text: 'Texto',
    idInternal: 'ID',
}

export const importPublicationsExpectedColumns = [
    {
        key: litigationColumns.litigation,
        example: '0001234-56.2024.8.26.0001',
        previewWidth: 200,
        variant: ['NÚMERO DO PROCESSO', 'PROCESSO', 'LITIGATION', 'NUMBER'],
    },
    {
        key: litigationColumns.text,
        example: 'Texto da publicação',
        previewWidth: 200,
        variant: ['TEXT', 'TEXTO DA PUBLICAÇÃO'],
    },
    {
        key: litigationColumns.idInternal,
        example: '1234567890',
        previewWidth: 200,
        variant: ['ID INTERNO', 'ID DA PUBLICAÇÃO'],
    }
]