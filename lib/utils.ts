// lib/utils.ts

// Utility function for className concatenation (like clsx/cn)
export function cn(...args: any[]): string {
  return args.filter(Boolean).join(' ');
}
