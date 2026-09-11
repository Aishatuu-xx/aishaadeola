/**
 * Format an amount in Nigerian Naira (₦) with clean comma grouping
 */
export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}
