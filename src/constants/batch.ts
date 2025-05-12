export const BATCH_TYPES = {
    PUBLICATIONS: 1,
    PROCESSES: 2,
} as const;


export const BATCH_STATUS = {
    PENDING: 1,
    PROCESSING: 2,
    COMPLETED: 3,
    FAILED: 4,
} as const;
