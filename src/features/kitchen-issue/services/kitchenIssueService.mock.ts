import { db, simulateDelay, KitchenIssue, Kitchen } from '../../../shared/mock/mockDb';
import { KitchenIssueQueryParams, CreateKitchenIssueDto } from '../types';
import { PaginatedResponse } from '../../../shared/types/common';
import dayjs from 'dayjs';

export async function getIssueHistory(params: KitchenIssueQueryParams): Promise<PaginatedResponse<KitchenIssue>> {
  await simulateDelay(400);

  const {
    page = 1,
    pageSize = 10,
    search = '',
    section = '',
    startDate = '',
    endDate = '',
  } = params;

  let filtered = [...db.kitchenIssues];

  // 1. Filter by Section
  if (section) {
    filtered = filtered.filter((i) => i.issuedToSection === section);
  }

  // 2. Search product names or notes
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.issuedToSection.toLowerCase().includes(q) ||
        i.items.some((item) => item.productName.toLowerCase().includes(q))
    );
  }

  // 3. Date filter
  if (startDate) {
    filtered = filtered.filter((i) => dayjs(i.date).isAfter(dayjs(startDate).subtract(1, 'day')));
  }
  if (endDate) {
    filtered = filtered.filter((i) => dayjs(i.date).isBefore(dayjs(endDate).add(1, 'day')));
  }

  // Sort chronological
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination
  const totalCount = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return {
    data: paginatedData,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

export async function getIssueById(id: string): Promise<KitchenIssue> {
  await simulateDelay(250);
  const issue = db.kitchenIssues.find((i) => i.id === id);
  if (!issue) throw new Error('Kitchen Issue record not found');
  return issue;
}

export async function createKitchenIssue(dto: CreateKitchenIssueDto): Promise<KitchenIssue> {
  await simulateDelay(500);

  if (!dto.issuedToSection) throw new Error('Receiving kitchen section is required');
  if (dto.items.length === 0) throw new Error('At least one ingredient must be issued');

  return db.createKitchenIssue(dto as any);
}

export async function getKitchens(): Promise<Kitchen[]> {
  await simulateDelay(150);
  return db.kitchens;
}

export async function createKitchen(kitchen: Kitchen): Promise<Kitchen> {
  await simulateDelay(300);
  return db.createKitchen(kitchen);
}
