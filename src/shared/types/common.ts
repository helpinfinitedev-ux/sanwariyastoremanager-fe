export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface CommonFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
}
