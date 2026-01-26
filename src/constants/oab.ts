export const OAB_STATUS = {
  PROCESSING: 1,
  ACTIVE: 2,
  INACTIVE: 3,
} as const;

export const OAB_STATUS_LABEL = {
  [OAB_STATUS.PROCESSING]: "Em processamento",
  [OAB_STATUS.ACTIVE]: "Ativa",
  [OAB_STATUS.INACTIVE]: "Inativa",
} as const;
