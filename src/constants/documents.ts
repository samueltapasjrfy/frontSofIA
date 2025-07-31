export const DOCUMENT_STATUS = {
    PENDING: 1,
    PROCESSING: 2,
    COMPLETED: 3,
    FAILED: 4,
}

export const DOCUMENT_CLASSIFICATION = {
    PROCEDENTE: 1,
    PARCIALMENTE_PROCEDENTE: 2,
    IMPROCEDENTE: 3,
    IMPOSSÍVEL_DETERMINAR: 4,
    HOMOLOGATÓRIA_DE_ACORDO: 5,
    EXTINÇÃO: 6,
}

export const DOCUMENT_CONFIDENCE = {
    ALTO: 1,
    MEDIO: 2,
    BAIXO: 3,
}

export const documentStatusColors = {
    [DOCUMENT_STATUS.PENDING]: 'bg-yellow-500 text-white',
    [DOCUMENT_STATUS.PROCESSING]: 'bg-blue-500 text-white',
    [DOCUMENT_STATUS.COMPLETED]: 'bg-green-500 text-white',
    [DOCUMENT_STATUS.FAILED]: 'bg-red-500 text-white',
    default: 'bg-gray-500',
}

export const documentClassificationColors = {
    [DOCUMENT_CLASSIFICATION.PROCEDENTE]: 'bg-green-500 text-white',
    [DOCUMENT_CLASSIFICATION.PARCIALMENTE_PROCEDENTE]: 'bg-yellow-500 text-white',
    [DOCUMENT_CLASSIFICATION.IMPROCEDENTE]: 'bg-red-500 text-white',
    [DOCUMENT_CLASSIFICATION.IMPOSSÍVEL_DETERMINAR]: 'bg-gray-300 text-white',
    [DOCUMENT_CLASSIFICATION.HOMOLOGATÓRIA_DE_ACORDO]: 'bg-blue-500 text-white',
    [DOCUMENT_CLASSIFICATION.EXTINÇÃO]: 'bg-purple-500 text-white',
    default: 'bg-gray-400',
}

export const documentConfidenceColors = {
    [DOCUMENT_CONFIDENCE.ALTO]: 'bg-green-500 text-white',
    [DOCUMENT_CONFIDENCE.MEDIO]: 'bg-yellow-500 text-white',
    [DOCUMENT_CONFIDENCE.BAIXO]: 'bg-red-500 text-white',
    default: 'bg-gray-400',
}