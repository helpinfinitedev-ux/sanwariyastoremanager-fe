import { KitchenIssue, KitchenIssueItem } from '../../shared/mock/mockDb';

export interface KitchenIssueQueryParams {
  page?: number;
  pageSize?: number;
  search?: string; // Product name or Section
  section?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateKitchenIssueDto {
  issuedToSection: string;
  issuedBy: string;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
