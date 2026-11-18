/** Prefix from a page at `pathname` back to the site root. */
export function rootPrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length === 0 ? './' : '../'.repeat(segments.length);
}

/** Client-side navigation that works for http(s) and the downloadable file:// bundle. */
export function clientHref(path: string): string {
  const clean = path.replace(/^\/+/, '');
  if (typeof document === 'undefined') return `/${clean}`;
  const prefix = document.documentElement.dataset.basePrefix ?? './';
  return `${prefix}${clean}`;
}

export function href(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}
