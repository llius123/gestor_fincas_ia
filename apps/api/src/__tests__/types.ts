// Database interfaces to replace 'as any' usage

export interface TableInfoResult {
  name: string;
  type?: string;
  pk?: number;
}

export interface TableColumn {
  name: string;
  type: string;
  pk: number;
  [key: string]: any;
}

export interface TestTableRecord {
  id: number;
  message: string;
  created_at: string;
}

export interface CountResult {
  count: number;
}