export const PUBLICATION_STATUS = {
    PENDING: 1,
    COMPLETED: 2,
    ERROR: 3,
    PROCESSING: 4,
}

export const PUBLICATION_CASE_TYPE = {
    CIVIL: 1,
    CRIMINAL: 2,
}

export const CLASSIFICATION_STATUS = {
    PENDING: 1,
    CONFIRMED: 2,
    REJECTED: 3,
    RECLASSIFIED: 4,
}

export const publicationStatusColors = {
    [PUBLICATION_STATUS.COMPLETED]: "bg-primary-green text-white",
    [PUBLICATION_STATUS.PENDING]: "bg-yellow-400 text-black",
    [PUBLICATION_STATUS.PROCESSING]: "bg-primary-blue text-white",
    [PUBLICATION_STATUS.ERROR]: "bg-red-500 text-white",
    default: "bg-gray-500 text-white"
};

export const classificationStatusColors: Record<string | number, string> = {
  1: "bg-yellow-400 text-black", // PENDING
  2: "bg-primary-green text-white", // CONFIRMED
  3: "bg-red-500 text-white", // REJECTED
  4: "bg-blue-500 text-white", // RECLASSIFIED
  default: "bg-gray-500 text-white"
};