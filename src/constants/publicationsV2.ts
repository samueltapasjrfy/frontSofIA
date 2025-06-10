export const PUBLICATION_STATUS = {
    PENDING: 1,
    PROCESSING: 2,
    COMPLETED: 3,
    ERROR: 4,
};

export const getStatusColor = (id: number) => {
    const colors: Record<number, string> = {
        [PUBLICATION_STATUS.PENDING]: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30",
        [PUBLICATION_STATUS.PROCESSING]: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
        [PUBLICATION_STATUS.COMPLETED]: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
        [PUBLICATION_STATUS.ERROR]: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
    }
    return colors[id] || "bg-gray-50 text-gray-700 border-gray-200"
}