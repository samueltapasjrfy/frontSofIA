export const PROCESS_STATUS = {
    IMPORTED: 0,
    PENDING: 1,
    PROCESSING: 2,
    COMPLETED: 3,
    ERROR: 4,
    NOT_FOUND: 5,
}

export const processStatusColors = {
    [PROCESS_STATUS.IMPORTED]: "bg-primary-green text-white",
    [PROCESS_STATUS.COMPLETED]: "bg-primary-green text-white",
    [PROCESS_STATUS.PENDING]: "bg-yellow-400 text-black",
    [PROCESS_STATUS.PROCESSING]: "bg-primary-blue text-white",
    [PROCESS_STATUS.ERROR]: "bg-red-500 text-white",
    [PROCESS_STATUS.NOT_FOUND]: "bg-red-500 text-white",
    default: "bg-gray-500 text-white"
};
