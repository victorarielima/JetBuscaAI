export interface SearchFormData {
  companyName: string;
  cnpj: string;
  location: string;
  industry: string;
  additionalInfo: string;
}

export interface ReportState {
  isLoading: boolean;
  data: string | null;
  error: string | null;
}

export enum QueryStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}