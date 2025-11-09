import { headers } from 'next/headers';

/**
 * Read the CSP nonce injected by the proxy from request headers.
 */
export function getCspNonce(hdrs?: any): string | null {
  try {
    const h: any = hdrs ?? (headers as unknown as () => any)();
    if (!h || typeof h.get !== 'function') return null;
    return h.get('x-csp-nonce') ?? null;
  } catch {
    return null;
  }
}
