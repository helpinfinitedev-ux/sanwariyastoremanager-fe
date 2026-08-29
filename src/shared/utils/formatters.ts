import dayjs from 'dayjs';

/**
 * Format number to currency (₹ INR)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === undefined || amount === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

/**
 * Format string/ISO date into user readable local formats
 */
export function formatDate(dateStr: string, format = 'MMM DD, YYYY hh:mm A'): string {
  if (!dateStr) return 'N/A';
  return dayjs(dateStr).format(format);
}

/**
 * Format numbers with decimal limits
 */
export function formatNumber(value: number, decimals = 2): string {
  if (isNaN(value) || value === undefined || value === null) return '0';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Truncate long descriptions
 */
export function truncateText(text: string, length = 60): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
