/**
 * Strip HTML entities and tags from WooCommerce price strings
 * e.g., "₨&nbsp;13" → "₨ 13"
 */
export function cleanPrice(price: string | null | undefined): string {
  if (!price) return '';
  return price
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8377;|&#8360;|\\u20a8/g, '₨')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Extract numeric value from price string
 */
export function getPriceNumber(price: string | null | undefined): number {
  if (!price) return 0;
  const cleaned = cleanPrice(price);
  const match = cleaned.match(/[\d,.]+/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
}

/**
 * Format price for display
 */
export function formatPrice(price: string | null | undefined): string {
  const cleaned = cleanPrice(price);
  if (!cleaned) return 'Price not available';
  return cleaned;
}

/**
 * cn – simple className merger
 */
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Truncate text
 */
export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Strip HTML tags from a string
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
