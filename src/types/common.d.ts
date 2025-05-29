interface PaginatedResponse<T> {
  data: T[];
  limit: number;
  skip: number;
  total: number;
}
