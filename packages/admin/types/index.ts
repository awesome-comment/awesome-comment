export type AcConfig = {
  adminEmails: string[];
}

export type ApiResponse<T> = {
  code: number;
  data?: T;
  message?: string;
  meta?: {
    total: number;
  };
}
