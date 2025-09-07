// Database result interfaces to replace 'as any' usage

export interface TableInfoResult {
  name: string;
  type?: string;
  pk?: number;
}