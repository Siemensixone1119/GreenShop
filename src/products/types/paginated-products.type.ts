import { ProductWithDetails } from './product-with-detail.type.js';

export type PaginatedProducts = {
  items: ProductWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
