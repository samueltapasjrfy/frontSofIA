export type ImportData = {
    rows: Array<{ [k: string]: string }>;
    expectedColumnsToRows: { [k: string]: string };
}

export type ExpectedColumns = {
    key: string;
    example: string | number;
    previewWidth?: number;
    variant?: string[];
}

export interface VerifyColumnsResponse {
    columns: { [k: string]: string };
    hasAll: boolean;
}

export enum ModalImportDataSteps {
    UPLOAD_FILE = 1,
    VALIDATE_COLUMNS = 2,
    VALIDATE_DATE = 3,
}