export const PROCESS_STATUS = {
    PENDING: 1,
    PROCESSING: 2,
    COMPLETED: 3,
    ERROR: 4,
}

export const processStatusColors = {
    [PROCESS_STATUS.COMPLETED]: "bg-primary-green text-white",
    [PROCESS_STATUS.PENDING]: "bg-yellow-400 text-black",
    [PROCESS_STATUS.PROCESSING]: "bg-primary-blue text-white",
    [PROCESS_STATUS.ERROR]: "bg-red-500 text-white",
    default: "bg-gray-500 text-white"
};
